import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

interface FactoryRanking {
  userId: string;
  userName: string;
  factoryName: string;
  averageScore: number;
  rank?: number;
}

interface UserProfile {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  created: string;
}

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  imports: [CommonModule]
})
export class RankingComponent implements OnInit {
  rankings: FactoryRanking[] = [];
  currentUserId: string = '';
  currentFullName: string = '';
  loading: boolean = true;
  errorMessage: string = '';
  userRankingPosition: number = 0;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    this.fetchUserProfile();
  }

  private calculateRanks(factories: FactoryRanking[]): FactoryRanking[] {
    // Sort by score in descending order
    const sorted = [...factories].sort((a, b) => b.averageScore - a.averageScore);
    
    let currentRank = 1;
    let previousScore = sorted[0]?.averageScore;
    
    // Assign ranks
    const rankedFactories = sorted.map((factory) => {
      // rank increment
      if (factory.averageScore < previousScore) {
        currentRank++;
        previousScore = factory.averageScore;
      }
      return { ...factory, rank: currentRank };
    });

    return rankedFactories;
  }

  fetchUserProfile() {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    this.http.get<UserProfile>('https://localhost:7299/api/Account/profile', { headers })
      .subscribe({
        next: (profile) => {
          this.currentFullName = `${profile.firstName} ${profile.lastName}`.toLowerCase();
          this.fetchRankings();
        },
        error: (error) => {
          console.error('Error fetching user profile:', error);
          this.errorMessage = 'Erreur lors de la récupération du profil.';
          this.loading = false;
        }
      });
  }

  fetchRankings() {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    this.http.get<FactoryRanking[]>('https://localhost:7299/api/Factory/factory-users-ranking', { headers })
      .subscribe({
        next: (data) => {
          this.rankings = this.calculateRanks(data);
          
          const currentUserFactory = this.rankings.find(factory => 
            factory.userName.toLowerCase() === this.currentFullName
          );
          
          if (currentUserFactory) {
            this.currentUserId = currentUserFactory.userId;
            this.userRankingPosition = currentUserFactory.rank || 0;
          } else {
            console.warn('Factory not found for user:', this.currentFullName);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching rankings:', error);
          this.errorMessage = 'Erreur lors de la récupération du classement.';
          this.loading = false;
        }
      });
  }
}
