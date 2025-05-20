import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-gestion-comptes',
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-comptes.component.html',
  styleUrl: './gestion-comptes.component.css'
})
export class GestionComptesComponent implements OnInit {
  users: any[] = [];
  factories: any[] = [];
  searchTerm: string = '';
  message: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  passwordRequirements: string = 'Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial';
  usersListTemplate: any;
  userImages: { [key: string]: string } = {};
  loading: boolean = true;

  // Role mapping 
  private roletranslation: { [key: string]: string } = {
    'Admin': 'Administrateur',
    'QualityM': 'Responsable Qualité',
    'Auditor': 'Auditeur',
    'FactoryM': 'Responsable d\'usine'
  };

  // Create user form state
  showCreateForm: boolean = false;
  isCreatingUser: boolean = false;
  username: string = '';
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  phone: string = '';
  role: string = '';
  factoryId: string = '';
  roles: string[] = ['Admin', 'QualityM', 'Auditor', 'FactoryM'];
  isRoleDropdownOpen: boolean = false;

  // Password generator configuration
  private readonly uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private readonly lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  private readonly numberChars = '0123456789';
  private readonly specialChars = '!@#$%^&*(),.?":{}|<>';
  
  // Password visibility and strength
  showPassword: boolean = false;
  passwordStrength: number = 0;
  passwordStrengthText: string = '';
  passwordStrengthColor: string = '';

  // Add base URL for user pictures
  private readonly baseUrl = 'https://localhost:7299/api/Account/get-picture-u?Username=';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchFactories();
  }

  fetchUsers(): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      this.loading = false;
      return;
    }
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    this.http.get<any[]>('https://localhost:7299/api/Admin/users', { headers })
      .subscribe({
        next: (data) => {
          this.users = data;
          this.loading = false;
          // Load images for all users
          this.users.forEach(user => {
            this.loadUserImage(user.username);
          });
        },
        error: (err) => {
          console.error('Erreur users', err);
          this.errorMessage = 'Erreur lors de la récupération des utilisateurs. Veuillez réessayer.';
          this.loading = false;
        }
      });
  }

  fetchFactories(): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      return;
    }
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    this.http.get<any[]>('https://localhost:7299/api/Admin/factories', { headers })
      .subscribe({
        next: (data) => {
          this.factories = data;
        },
        error: (err) => {
          console.error('Erreur factories', err);
          this.errorMessage = 'Error fetching factories. Please try again.';
        }
      });
  }

  filteredUsers(): any[] {
    if (!this.searchTerm) return this.users;
    
    
    const searchParts = this.searchTerm.toLowerCase().split(' ').filter(part => part.trim() !== '');
    
    return this.users.filter(user => {
      const fullName = `${user.firstName.toLowerCase()} ${user.lastName.toLowerCase()}`;
      const reversedFullName = `${user.lastName.toLowerCase()} ${user.firstName.toLowerCase()}`;
      
     
      return searchParts.every(part => 
        fullName.includes(part) || reversedFullName.includes(part)
      );
    });
  }

  // create user
  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.message = '';
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.showCreateForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.username = '';
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.password = '';
    this.phone = '';
    this.role = '';
    this.factoryId = '';
  }

  shouldShowFactoryId(): boolean {
    return this.role === 'FactoryM';
  }

  // Password validation function
  private validatePassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasUpperCase && hasNumber && hasSpecialChar;
  }

  // Username validation function
  private validateUsername(username: string): boolean {
    // Username should be at least 3 characters long and contain only letters, numbers, and underscores
    return /^[a-zA-Z0-9_]{3,}$/.test(username);
  }

  // Check if username is unique
  private isUsernameUnique(username: string): boolean {
    return !this.users.some(user => user.username.toLowerCase() === username.toLowerCase());
  }

  // Calculate password strength
  private calculatePasswordStrength(password: string): void {
    let strength = 0;
    
    // Length check (0-25 points)
    strength += Math.min(password.length * 2, 25);
    
    // Character type checks (0-15 points each)
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;
    
    // Additional complexity (0-15 points)
    const uniqueChars = new Set(password).size;
    strength += Math.min(uniqueChars * 2, 15);
    
    this.passwordStrength = strength;
    
    // Set strength text and color
    if (strength < 30) {
      this.passwordStrengthText = 'Faible';
      this.passwordStrengthColor = 'bg-red-500';
    } else if (strength < 60) {
      this.passwordStrengthText = 'Moyen';
      this.passwordStrengthColor = 'bg-yellow-500';
    } else if (strength < 90) {
      this.passwordStrengthText = 'Fort';
      this.passwordStrengthColor = 'bg-green-500';
    } else {
      this.passwordStrengthText = 'Très fort';
      this.passwordStrengthColor = 'bg-blue-500';
    }
  }

  // Generate a strong password
  generatePassword(): void {
    let generatedPassword = '';
    
    // Ensure at least one of each required character type
    generatedPassword += this.uppercaseChars[Math.floor(Math.random() * this.uppercaseChars.length)];
    generatedPassword += this.lowercaseChars[Math.floor(Math.random() * this.lowercaseChars.length)];
    generatedPassword += this.numberChars[Math.floor(Math.random() * this.numberChars.length)];
    generatedPassword += this.specialChars[Math.floor(Math.random() * this.specialChars.length)];
    
    // Add additional random characters to make it longer 
    const allChars = this.uppercaseChars + this.lowercaseChars + this.numberChars + this.specialChars;
    while (generatedPassword.length < 16) {
      generatedPassword += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    this.password = generatedPassword.split('').sort(() => Math.random() - 0.5).join('');
    this.calculatePasswordStrength(this.password);
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

 
  onPasswordChange(): void {
    this.calculatePasswordStrength(this.password);
  }
  

  createUser(): void {
 
    this.errorMessage = '';
    this.successMessage = '';
    this.message = '';
    
    // Validate username
    if (!this.validateUsername(this.username)) {
      this.errorMessage = 'Le nom d\'utilisateur doit contenir au moins 3 caractères et ne peut contenir que des lettres, chiffres et underscores.';
      return;
    }

    // Check username uniqueness
    if (!this.isUsernameUnique(this.username)) {
      this.errorMessage = 'Ce nom d\'utilisateur est déjà utilisé.';
      return;
    }

    // Validate password
    if (!this.validatePassword(this.password)) {
      this.errorMessage = this.passwordRequirements;
      return;
    }

    

    if (this.phone.length!==8) {
      this.errorMessage = ' Le numéro de téléphone doit contenir exactement 8 chiffres. ';
      return;
    }

    // Validate required fields
    if (!this.firstName || !this.lastName || !this.email || !this.role) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      return;
    }
    const headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');

    const payload: any = {
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      phone: this.phone,
      role: this.role
    };
    if (this.shouldShowFactoryId()) {
      if (!this.factoryId) {
        this.errorMessage = 'L\'ID de l\'usine est requis pour un Factory Manager.';
        return;
      }
      payload.factoryId = this.factoryId;
    }

    this.isCreatingUser = true;
    this.http.post('https://localhost:7299/api/Admin/createUser', payload, {
      headers,
      responseType: 'text' as 'json'
    }).subscribe({
      next: (response) => {
      
        this.successMessage = 'Utilisateur créé avec succès!';
        this.isCreatingUser = false;
        
       
        this.fetchUsers();
        
     
        setTimeout(() => {
          this.showCreateForm = false;
          this.resetForm();
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Erreur lors de la création de l\'utilisateur:', err);
        if (err.status === 400 && (err.error?.message?.includes('already has a factory manager') || err.error?.includes('already has a factory manager'))) {
          this.errorMessage = 'Cette usine a déjà un responsable d\'usine assigné.';
        } else {
          this.errorMessage = err.error || 'Erreur lors de la création de l\'utilisateur. Veuillez réessayer.';
        }
        this.isCreatingUser = false;
      }
    });
  }

  // EDIT ROLE 
  startEditRole(user: any): void {
    user.isEditing = true;
    user.newRole = user.role;
    user.newFactoryId = user.factoryId || '';
    this.message = '';
    this.errorMessage = '';
  }

  
  changeRole(user: any): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      return;
    }

    // Validate factory ID if role is FactoryM
    if (user.newRole === 'FactoryM' && !user.newFactoryId) {
      this.errorMessage = 'L\'ID de l\'usine est requis pour un Factory Manager.';
      return;
    }

    const headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Content-Type', 'application/json');

    const payload: any = {
      userid: user.id,
      newRole: user.newRole
    };

    // Add factoryId to payload if role is FactoryM
    if (user.newRole === 'FactoryM') {
      payload.factoryId = user.newFactoryId;
    }

    this.http.put<any>('https://localhost:7299/api/Admin/changeRole', payload, { headers })
      .subscribe({
        next: (res) => {
          user.role = user.newRole;
          user.factoryId = user.newFactoryId;
          user.isEditing = false;
          this.message = res?.message || 'Rôle mis à jour avec succès.';
        },
        error: (err) => {
          console.error('Erreur lors de la modification du rôle:', err);
          if (err.status === 400 ) {
            this.errorMessage = 'Cette usine a déjà un responsable d\'usine assigné.';
          } else {
            this.errorMessage = 'Erreur lors de la modification du rôle. Veuillez réessayer.';
          }
        }
      });
  }


  cancelEditRole(user: any): void {
    user.isEditing = false;
  }

  // -----DELETE USER --------//

  deleteUser(user: any): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    const token = this.cookieService.get('jwt_token');
    if (!token) {
      this.errorMessage = 'Token non trouvé. Veuillez vous connecter.';
      return;
    }

    const headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token);

    this.http.delete(`https://localhost:7299/api/Admin/user/${user.id}`, { 
      headers,
      responseType: 'text' as 'json'
    })
      .subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.successMessage = 'Utilisateur supprimé avec succès';
          this.errorMessage = '';
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (err) => {
          console.error('Error suppression', err);
          this.errorMessage = 'Erreur lors de la suppression de l\'utilisateur.';
          this.successMessage = '';
        }
      });
  }

  //  load user image
  loadUserImage(username: string): void {
    const token = this.cookieService.get('jwt_token');
    if (!token) {
      console.error('No JWT token found');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    const url = this.baseUrl + username;


    this.http.get(url, { 
      headers,
      responseType: 'text'
    }).subscribe({
      next: (res: string) => {
        this.userImages[username] = res;

      },
      error: (err) => {
        console.error('Error image', err);
      }
    });
  }

  // les roles en français
  getFrenchRoleName(role: string): string {
    return this.roletranslation[role] || role;
  }

  // Add this new method
  onRoleSelect(event: Event): void {
    event.stopPropagation();
    this.isRoleDropdownOpen = true;
  }

  // Add this method to handle role change
  onRoleChange(): void {
    this.isRoleDropdownOpen = false;
  }

  // Add these new methods for custom dropdown
  toggleRoleDropdown(): void {
    this.isRoleDropdownOpen = !this.isRoleDropdownOpen;
  }

  selectRole(selectedRole: string): void {
    this.role = selectedRole;
    this.isRoleDropdownOpen = false;
  }

  // Add click outside handler
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.role-dropdown')) {
      this.isRoleDropdownOpen = false;
    }
  }
}
