import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicStorageModule } from '@ionic/storage-angular';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { Tab2Page } from './tab2/tab2.page';
import { HttpClientModule } from '@angular/common/http';
import { PostProvider } from '../provider/post-provider';
import { FilterPipe } from './filter.pipe';

import { KamusPageRoutingModule } from './kamus/kamus-routing.module';
import { KamusPage } from './kamus/kamus.page';
import { IlmutanahPageRoutingModule } from './ilmutanah/ilmutanah-routing.module';
import { IlmutanahPage } from './ilmutanah/ilmutanah.page';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    KamusPageRoutingModule,
    IlmutanahPageRoutingModule,
    ReactiveFormsModule,
    IonicStorageModule.forRoot()

  ],
  providers: [
    PostProvider,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent, Tab2Page, FilterPipe, KamusPage, IlmutanahPage],
})
export class AppModule {}
