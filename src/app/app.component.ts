import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'gatin-chorrin';

  // sinais para imagem atual e estado de carregamento/erro
  currentImageUrl = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  generateCat(): void {
    this.fetchRandomImage('cat');
  }

  generateDog(): void {
    this.fetchRandomImage('dog');
  }

  private fetchRandomImage(kind: 'cat' | 'dog'): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // APIs públicas simples para imagens aleatórias
    // Gatos: https://cataas.com/cat   (retorna imagem direta)
    // Cachorros: https://dog.ceo/api/breeds/image/random (JSON com URL)

    if (kind === 'cat') {
      // Para evitar cache, inclui um query param aleatório
      const url = `https://cataas.com/cat?${Date.now()}`;
      // Como é uma imagem direta, não precisamos fazer GET para o binário; usamos a URL
      this.currentImageUrl.set(url);
      this.isLoading.set(false);
    } else {
      this.http
        .get<{ message: string; status: string }>(
          'https://dog.ceo/api/breeds/image/random'
        )
        .subscribe({
          next: (res) => {
            this.currentImageUrl.set(res.message);
            this.isLoading.set(false);
          },
          error: () => {
            this.errorMessage.set('Não foi possível carregar a imagem.');
            this.isLoading.set(false);
          },
        });
    }
  }
}
