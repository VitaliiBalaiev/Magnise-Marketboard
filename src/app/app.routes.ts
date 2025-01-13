import { Routes } from '@angular/router';
import {OverviewComponent} from '../overview/overview.component';
import {WatchlistComponent} from '../watchlist/watchlist.component';

export const routes: Routes = [
  { path: '', redirectTo: '/overview', pathMatch: 'full' },
  {path: 'overview', component: OverviewComponent},
  {path: 'watchlist', component: WatchlistComponent},
];

