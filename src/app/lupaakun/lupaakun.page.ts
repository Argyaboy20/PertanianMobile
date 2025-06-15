import { Component, OnInit } from '@angular/core';
import { PostProvider } from '../../provider/post-provider';
import { ToastController, LoadingController, Platform } from '@ionic/angular';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-lupaakun',
  templateUrl: './lupaakun.page.html',
  styleUrls: ['./lupaakun.page.scss'],
})
export class LupaakunPage implements OnInit {
  email: string = '';
  isLoading: boolean = false;
  private backButtonSubscription: any;

  constructor(
    private postPvdr: PostProvider,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private platform: Platform,
    private router: Router,
    private location: Location
  ) {
    // Prevent default browser refresh behavior
    if (this.platform.is('desktop') || this.platform.is('mobileweb')) {
      window.addEventListener('beforeunload', (e) => {
        // Store current route
        localStorage.setItem('lastRoute', '/lupaakun');
      });
    }
  }

  ngOnInit() {
    this.maintainRoute();
  }

  ionViewWillEnter() {
    // Ensure URL is correct when entering the page
    this.location.replaceState('/lupaakun');

    // Subscribe to the back button event
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, () => {
      this.router.navigate(['/tabs/tab1']);
    });
  }
  
  ionViewWillLeave() {
    // Unsubscribe from the back button event when leaving the page
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
  }

  private maintainRoute() {
    // Check if we're coming from a refresh
    const lastRoute = localStorage.getItem('lastRoute');
    if (lastRoute === '/lupaakun') {
      // Force URL to stay as /lupaakun
      this.location.replaceState('/lupaakun');
    }

    // Set up refresh handling
    if (this.platform.is('desktop') || this.platform.is('mobileweb')) {
      window.addEventListener('load', () => {
        if (lastRoute === '/lupaakun') {
          this.location.replaceState('/lupaakun');
        }
      });
    }
  }

  async kirimInformasi() {
    if (this.isLoading) return;

    let loading: HTMLIonLoadingElement | null = null;

    try {
      // Validasi input
      if (!this.email) {
        await this.presentToast('Harap isi email');
        return;
      }

      if (!this.validateEmail(this.email)) {
        await this.presentToast('Format email tidak valid');
        return;
      }

      this.isLoading = true;
      loading = await this.loadingController.create({
        message: 'Mengirim informasi...',
        spinner: 'circles',
        backdropDismiss: false
      });
      await loading.present();

      const body = {
        email: this.email.trim(),
        aksi: 'lupa_akun'
      };

      const response = await this.postPvdr.postData(body, 'action.php')
        .pipe(
          tap(response => {
            console.log('Server response:', response);
          }),
          catchError(error => {
            console.error('Error details:', error);
            
            // Handle network errors
            if (!navigator.onLine) {
              return throwError(() => new Error('Tidak ada koneksi internet. Mohon periksa koneksi Anda.'));
            }
            
            // Handle API errors
            if (error.error) {
              if (typeof error.error === 'string') {
                try {
                  const parsedError = JSON.parse(error.error);
                  return throwError(() => new Error(parsedError.message || 'Terjadi kesalahan pada server'));
                } catch (e) {
                  return throwError(() => new Error(error.error));
                }
              }
              return throwError(() => new Error(error.error.message || 'Terjadi kesalahan pada server'));
            }
            
            return throwError(() => new Error('Gagal menghubungi server. Mohon coba beberapa saat lagi.'));
          })
        )
        .toPromise();

      if (response.success) {
        await this.presentToast(response.message);
        this.email = '';
      } else {
        throw new Error(response.message || 'Gagal mengirim informasi akun');
      }

    } catch (error: any) {
      console.error('Error sending email:', error);
      await this.presentToast(error.message || 'Terjadi kesalahan saat mengirim email');
    } finally {
      this.isLoading = false;
      if (loading) {
        await loading.dismiss();
      }
    }
  }

  private validateEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 4000,
      position: 'bottom',
      cssClass: 'custom-toast'
    });
    await toast.present();
  }
}