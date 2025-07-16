import { useEffect, useState } from 'react';

interface MicroInteraction {
  type: 'pulse' | 'shimmer' | 'bounce' | 'fade' | 'slide';
  duration: number;
  delay?: number;
  easing?: string;
}

interface LoadingMicroInteractionsConfig {
  enableMicroInteractions?: boolean;
  enableContentPreviews?: boolean;
  enableProgressIndicators?: boolean;
  enableSkeletonAnimations?: boolean;
}

export const useLoadingMicroInteractions = (
  config: LoadingMicroInteractionsConfig = {}
) => {
  const {
    enableMicroInteractions = true,
    enableContentPreviews = true,
    enableProgressIndicators = true,
    enableSkeletonAnimations = true
  } = config;

  const [activeInteractions, setActiveInteractions] = useState<string[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Shimmer effect for loading content
  const createShimmerEffect = (element: HTMLElement) => {
    if (!enableSkeletonAnimations) return;

    element.style.background = `
      linear-gradient(90deg, 
        hsl(var(--muted)) 25%, 
        hsl(var(--muted-foreground) / 0.1) 50%, 
        hsl(var(--muted)) 75%
      )
    `;
    element.style.backgroundSize = '200% 100%';
    element.style.animation = 'shimmer 1.5s infinite';
    
    // Add shimmer keyframes if not already present
    if (!document.querySelector('#shimmer-styles')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles';
      style.textContent = `
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse-gentle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Content preview with blur-to-focus effect
  const createContentPreview = (element: HTMLElement, previewText: string) => {
    if (!enableContentPreviews) return;

    const preview = document.createElement('div');
    preview.className = 'content-preview';
    preview.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: hsl(var(--background));
      color: hsl(var(--muted-foreground));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      z-index: 1;
      transition: opacity 0.3s ease;
    `;
    preview.textContent = previewText;
    
    element.style.position = 'relative';
    element.appendChild(preview);

    return preview;
  };

  // Progress ring animation
  const createProgressRing = (element: HTMLElement, progress: number) => {
    if (!enableProgressIndicators) return;

    const ring = document.createElement('div');
    ring.className = 'progress-ring';
    ring.style.cssText = `
      width: 24px;
      height: 24px;
      border: 2px solid hsl(var(--muted));
      border-top: 2px solid hsl(var(--primary));
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: auto;
    `;

    if (!document.querySelector('#progress-styles')) {
      const style = document.createElement('style');
      style.id = 'progress-styles';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    element.appendChild(ring);
    return ring;
  };

  // Micro interaction for successful load
  const triggerSuccessInteraction = (element: HTMLElement) => {
    if (!enableMicroInteractions) return;

    element.style.animation = 'fade-in 0.3s ease-out';
    
    // Add success checkmark
    const checkmark = document.createElement('div');
    checkmark.innerHTML = '✓';
    checkmark.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      color: hsl(var(--success));
      font-weight: bold;
      animation: bounce-soft 0.5s ease;
      z-index: 10;
    `;
    
    element.style.position = 'relative';
    element.appendChild(checkmark);
    
    setTimeout(() => {
      checkmark.remove();
    }, 2000);
  };

  // Staggered loading animation for lists
  const applyStaggeredLoading = (elements: HTMLElement[], delay = 100) => {
    elements.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, index * delay);
    });
  };

  // Progressive loading with visual feedback
  const createProgressiveLoader = (
    element: HTMLElement,
    stages: Array<{ name: string; progress: number }>
  ) => {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
      width: 100%;
      height: 2px;
      background: hsl(var(--muted));
      border-radius: 1px;
      overflow: hidden;
      margin-bottom: 8px;
    `;
    
    const progressFill = document.createElement('div');
    progressFill.style.cssText = `
      height: 100%;
      background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary-glow)));
      width: 0%;
      transition: width 0.3s ease;
    `;
    
    progressBar.appendChild(progressFill);
    element.insertBefore(progressBar, element.firstChild);
    
    let currentStage = 0;
    const updateProgress = () => {
      if (currentStage < stages.length) {
        const stage = stages[currentStage];
        progressFill.style.width = `${stage.progress}%`;
        setLoadingProgress(stage.progress);
        currentStage++;
        
        if (currentStage < stages.length) {
          setTimeout(updateProgress, 300);
        } else {
          setTimeout(() => {
            progressBar.remove();
            triggerSuccessInteraction(element);
          }, 500);
        }
      }
    };
    
    updateProgress();
  };

  return {
    createShimmerEffect,
    createContentPreview,
    createProgressRing,
    triggerSuccessInteraction,
    applyStaggeredLoading,
    createProgressiveLoader,
    loadingProgress,
    // Helper utilities
    addLoadingClass: (element: HTMLElement, className = 'loading') => {
      element.classList.add(className);
      setActiveInteractions(prev => [...prev, element.id || 'anonymous']);
    },
    removeLoadingClass: (element: HTMLElement, className = 'loading') => {
      element.classList.remove(className);
      setActiveInteractions(prev => prev.filter(id => id !== (element.id || 'anonymous')));
    },
    isLoading: (elementId: string) => activeInteractions.includes(elementId)
  };
};