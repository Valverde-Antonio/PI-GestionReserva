import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { FormsModule } from '@angular/forms';
import { importProvidersFrom } from '@angular/core'; 

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    importProvidersFrom(FormsModule) 
  ]
})
.catch((err) => console.error(err));
