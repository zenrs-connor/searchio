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
import { ListProcessComponent } from './list-process/list-process.component';
import { CondensedSourcesComponent } from './condensed-sources/condensed-sources.component';
import { DataTableComponent } from './data-table/data-table.component';
import { ProcessResultComponent } from './process-result/process-result.component';
import { EncodeUriPipe } from './pipes/encode-uri.pipe';
import { HovercardDirective } from './directives/hovercard.directive';
import { MapComponent } from './map/map.component';
import { FilterTermPipe } from './pipes/filter-term.pipe';


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
    ProgressTrackerComponent,
    ListProcessComponent,
    CondensedSourcesComponent,
    DataTableComponent,
    ProcessResultComponent,
    EncodeUriPipe,
    HovercardDirective,
    MapComponent
    FilterTermPipe
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
