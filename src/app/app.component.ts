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
  currentMediaKind = signal<'image' | 'video' | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  generateCat(): void {
    this.fetchRandomImage('cat');
  }

  generateDog(): void {
    this.fetchRandomImage('dog');
  }

  generateCatVideo(): void {
    // Usa GIF animado do cataas, exibido via <img>
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const url = `https://cataas.com/cat/gif?${Date.now()}`;
    this.currentImageUrl.set(url);
    this.currentMediaKind.set('image');
    this.isLoading.set(false);
  }

  generateDogVideo(): void {
    // Busca vídeo do random.dog garantindo extensão de vídeo
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.fetchRandomDogVideoWithRetries(5);
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
      this.currentMediaKind.set('image');
      this.isLoading.set(false);
    } else {
      this.http
        .get<{ message: string; status: string }>(
          'https://dog.ceo/api/breeds/image/random'
        )
        .subscribe({
          next: (res) => {
            this.currentImageUrl.set(res.message);
            this.currentMediaKind.set('image');
            this.isLoading.set(false);
          },
          error: () => {
            this.errorMessage.set('Não foi possível carregar a imagem.');
            this.isLoading.set(false);
          },
        });
    }
  }

  private fetchRandomDogVideoWithRetries(triesLeft: number): void {
    this.http
      .get<{ url: string }>('https://random.dog/woof.json')
      .subscribe({
        next: (res) => {
          const url = res.url;
          const lower = url.toLowerCase();
          const isVideo = lower.endsWith('.mp4') || lower.endsWith('.webm');
          if (isVideo) {
            this.currentImageUrl.set(url);
            this.currentMediaKind.set('video');
            this.isLoading.set(false);
          } else if (triesLeft > 0) {
            this.fetchRandomDogVideoWithRetries(triesLeft - 1);
          } else {
            this.errorMessage.set('Não encontrei vídeo agora. Tente novamente.');
            this.isLoading.set(false);
          }
        },
        error: () => {
          this.errorMessage.set('Erro ao buscar vídeo.');
          this.isLoading.set(false);
        },
      });
  }
}
