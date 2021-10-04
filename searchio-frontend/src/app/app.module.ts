import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { SearchioNavComponent } from './searchio-nav/searchio-nav.component';
import { ServiceInjectedComponent } from './service-injected/service-injected.component';
import { FilterBarComponent } from './filter-bar/filter-bar.component';
import { QueriesContainerComponent } from './queries-container/queries-container.component';
import { SearchioResultsComponent } from './searchio-results/searchio-results.component';
import { QueryResultComponent } from './query-result/query-result.component';
import { ResultFilterComponent } from './result-filter/result-filter.component';
import { CapitalifyPipe } from './pipes/capitalify.pipe';
import { ProgressTrackerComponent } from './progress-tracker/progress-tracker.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SearchioNavComponent,
    ServiceInjectedComponent,
    FilterBarComponent,
    QueriesContainerComponent,
    SearchioResultsComponent,
    QueryResultComponent,
    ResultFilterComponent,
    CapitalifyPipe,
    ProgressTrackerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
