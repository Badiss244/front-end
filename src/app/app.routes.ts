import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { AboutComponent } from './about/about.component';
import { AideComponent } from './aide/aide.component';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ProfileComponent } from './profile/profile.component';
import { GestionComptesComponent } from './gestion-comptes/gestion-comptes.component';
import { GestionFilialesComponent } from './gestion-filiales/gestion-filiales.component';
import { authGuard } from './guards/auth.guard';
import { GestionUsinesComponent } from './gestion-usines/gestion-usines.component';
import { AuditorComponent } from './auditor/auditor.component';
import { AuditsComponent } from './audits/audits.component';
import { NotificationComponent } from './notification/notification.component';
import { GetNotificationComponent } from './get-notification/get-notification.component';
import { RealiserRapportComponent } from './realiser-rapport/realiser-rapport.component';
import { HistoryAuditComponent } from './history-audit/history-audit.component';
import { QualityManagerComponent } from './quality-manager/quality-manager.component';
import { AfficherRapportComponent } from './afficher-rapport/afficher-rapport.component';
import { PlanActionComponent } from './plan-action/plan-action.component';
import { RapportQualityComponent } from './rapport-quality/rapport-quality.component';
import { FactoryManagerComponent } from './factory-manager/factory-manager.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { RapportFactoryComponent } from './rapport-factory/rapport-factory.component';
import { PlanActionFactoryComponent } from './plan-action-factory/plan-action-factory.component';
import { RankingComponent } from './ranking/ranking.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { AuditorHomeComponent } from './auditor-home/auditor-home.component';
import { QualityHomeComponent } from './quality-home/quality-home.component';
import { FactoryHomeComponent } from './factory-home/factory-home.component';
import { GestionSComponent } from './gestion-s/gestion-s.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'about', component: AboutComponent },
  { path: 'aide', component: AideComponent },
  { path: 'login', component: LoginComponent },
  { path :'unauthorized', component : UnauthorizedComponent},
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard],
    data: { role: 'admin' },
    children: [
      // When navigating to /admin/gestion-comptes, the GestionComptesComponent is rendered inside the AdminComponent.
      { path: 'gestion-comptes', component: GestionComptesComponent },
      { path: 'gestion-filiales', component: GestionFilialesComponent },
      { path: 'gestion-usines', component: GestionUsinesComponent },
      {path :'admin-home', component : AdminHomeComponent},
      {path :'gestion-S',component : GestionSComponent}
    ]
  },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { 
    path: 'auditor', 
    component: AuditorComponent,
    canActivate: [authGuard],
    data: { role: 'auditor' },
    children : [
      {path: 'audits', component: AuditsComponent} , 
      {path :'realiser-rapport', component: RealiserRapportComponent},
      {path : 'historique', component : HistoryAuditComponent},
      {path :'afficher-rapport' , component : AfficherRapportComponent},
      {path :'auditor-home',component :AuditorHomeComponent}
      
    ]
  },
  { path : 'notification', component : NotificationComponent , canActivate: [authGuard]},
  { path: 'get-notification' , component : GetNotificationComponent , canActivate: [authGuard]},
  { path :'quality-manager' ,
    component : QualityManagerComponent, 
    canActivate : [authGuard], 
    data : { role : 'qualitym'},
    children : [
      {path : 'plan-action', component: PlanActionComponent}, 
      {path : 'rapport', component : RapportQualityComponent},
      {path :'quality-home', component : QualityHomeComponent}
    ]
  },
  { path :'factory-manager' ,
    component : FactoryManagerComponent, 
    canActivate : [authGuard], 
    data : { role : 'factorym'},
    children : [ 
      {path :'rapport-factory', component : RapportFactoryComponent},
      {path :'plan-action-factory' , component : PlanActionFactoryComponent},
      {path :'ranking', component : RankingComponent},
      {path :'factory-home', component : FactoryHomeComponent}
    ]
  }

];
