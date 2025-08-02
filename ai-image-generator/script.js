// AI Image Generator JavaScript

class AIImageGenerator {
    constructor() {
        this.currentAspectRatio = '1:1';
        this.currentStyle = 'photorealistic';
        this.currentModel = 'default'; // Pollinations.AI doesn't have explicit model selection via API, but we can keep a default
        this.isGenerating = false;
        
        this.initializeElements();
        this.bindEvents();
        this.setupExamplePrompts();
        // Pollinations.AI image generation API doesn't seem to support model selection directly via API parameters
        // this.fetchAvailableModels(); 
    }

    initializeElements() {
        // Input elements
        this.promptInput = document.getElementById('prompt-input');
        this.generateBtn = document.getElementById('generate-btn');
        this.styleSelector = document.getElementById('style-selector');
        this.modelSelector = document.getElementById('model-selector'); // Model selector will be hidden or removed if not used
        
        // Button elements
        this.btnText = this.generateBtn.querySelector('.btn-text');
        this.btnLoader = this.generateBtn.querySelector('.btn-loader');
        
        // Aspect ratio buttons
        this.aspectBtns = document.querySelectorAll('.aspect-btn');
        
        // State containers
        this.placeholder = document.getElementById('placeholder');
        this.loadingState = document.getElementById('loading-state');
        this.imageResult = document.getElementById('image-result');
        this.errorState = document.getElementById('error-state');
        
        // Result elements
        this.generatedImage = document.getElementById('generated-image');
        this.usedPrompt = document.getElementById('used-prompt');
        this.downloadBtn = document.getElementById('download-btn');
        this.shareBtn = document.getElementById('share-btn');
        this.regenerateBtn = document.getElementById('regenerate-btn');
        this.retryBtn = document.getElementById('retry-btn');
        this.errorMessage = document.getElementById('error-message');
        this.loadingMessage = document.getElementById('loading-message');
        
        // Example prompt buttons
        this.exampleBtns = document.querySelectorAll('.example-btn');

        // Hide model selector if Pollinations.AI doesn't support it directly
        if (this.modelSelector) {
            this.modelSelector.closest('.option-group').style.display = 'none';
        }
    }

    bindEvents() {
        // Generate button
        this.generateBtn.addEventListener('click', () => this.generateImage());
        
        // Enter key in textarea
        this.promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.generateImage();
            }
        });
        
        // Aspect ratio selection
        this.aspectBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectAspectRatio(btn));
        });
        
        // Style selection
        this.styleSelector.addEventListener('change', (e) => {
            this.currentStyle = e.target.value;
        });
        
        // Action buttons
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.shareBtn.addEventListener('click', () => this.shareImage());
        this.regenerateBtn.addEventListener('click', () => this.generateImage());
        this.retryBtn.addEventListener('click', () => this.generateImage());
        
        // Example prompts
        this.exampleBtns.forEach(btn => {
            btn.addEventListener('click', () => this.useExamplePrompt(btn));
        });
    }

    setupExamplePrompts() {
        // Additional example prompts that can be randomly selected
        this.additionalPrompts = [
            "A serene beach at sunrise with gentle waves and seagulls",
            "A mystical forest with glowing mushrooms and fairy lights",
            "A steampunk airship floating above Victorian London",
            "A minimalist modern kitchen with marble countertops",
            "A vibrant street art mural on a brick wall",
            "A peaceful mountain lake reflecting snow-capped peaks",
            "A cozy library with floor-to-ceiling bookshelves",
            "A futuristic robot in a high-tech laboratory"
        ];
    }

    selectAspectRatio(selectedBtn) {
        // Remove active class from all buttons
        this.aspectBtns.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to selected button
        selectedBtn.classList.add('active');
        
        // Update current aspect ratio
        this.currentAspectRatio = selectedBtn.dataset.ratio;
    }

    useExamplePrompt(btn) {
        const prompt = btn.dataset.prompt;
        this.promptInput.value = prompt;
        this.promptInput.focus();
        
        // Add a subtle animation to show the prompt was applied
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
        }, 150);
    }

    // Removed fetchAvailableModels as Pollinations.AI image generation API doesn't seem to support model selection directly via API parameters
    // async fetchAvailableModels() { ... }

    // Removed populateModelSelector as Pollinations.AI image generation API doesn't seem to support model selection directly via API parameters
    // populateModelSelector(models) { ... }

    async generateImage() {
        const prompt = this.promptInput.value.trim();
        
        if (!prompt) {
            this.showError('Please enter a description for your image.');
            return;
        }
        
        if (this.isGenerating) {
            return;
        }
        
        this.isGenerating = true;
        this.showLoadingState();
        this.updateGenerateButton(true);
        this.loadingMessage.textContent = 'Starting image generation...';
        
        try {
            // Construct the URL for Pollinations.AI image generation
            // Aspect ratio and style can be added to the prompt for better results
            const fullPrompt = `${prompt}, ${this.currentStyle} style, aspect ratio ${this.currentAspectRatio}`;
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}`;

            // Fetch the image as a Blob
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }
            const imageBlob = await response.blob();
            const objectUrl = URL.createObjectURL(imageBlob);

            this.showImageResult(objectUrl, prompt);
            
        } catch (error) {
            console.error('Error generating image:', error);
            this.showError('Failed to generate image. Please try again. ' + error.message);
        } finally {
            this.isGenerating = false;
            this.updateGenerateButton(false);
        }
    }

    showLoadingState() {
        this.hideAllStates();
        this.loadingState.classList.remove('hidden');
    }

    showImageResult(imageUrl, prompt) {
        this.hideAllStates();
        
        this.generatedImage.src = imageUrl;
        this.usedPrompt.textContent = prompt;
        this.imageResult.classList.remove('hidden');
        
        // Add fade-in animation
        this.generatedImage.style.opacity = '0';
        this.generatedImage.onload = () => {
            this.generatedImage.style.transition = 'opacity 0.5s ease';
            this.generatedImage.style.opacity = '1';
        };
    }

    showError(message) {
        this.hideAllStates();
        this.errorMessage.textContent = message;
        this.errorState.classList.remove('hidden');
    }

    hideAllStates() {
        this.placeholder.classList.add('hidden');
        this.loadingState.classList.add('hidden');
        this.imageResult.classList.add('hidden');
        this.errorState.classList.add('hidden');
    }

    updateGenerateButton(isLoading) {
        if (isLoading) {
            this.btnText.classList.add('hidden');
            this.btnLoader.classList.remove('hidden');
            this.generateBtn.disabled = true;
        } else {
            this.btnText.classList.remove('hidden');
            this.btnLoader.classList.add('hidden');
            this.generateBtn.disabled = false;
        }
    }

    async downloadImage() {
        try {
            const response = await fetch(this.generatedImage.src);
            const blob = await response.blob();
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-generated-image-${Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showNotification('Image downloaded successfully!');
        } catch (error) {
            console.error('Error downloading image:', error);
            this.showNotification('Failed to download image.', 'error');
        }
    }

    async shareImage() {
        if (navigator.share) {
            try {
                const response = await fetch(this.generatedImage.src);
                const blob = await response.blob();
                const file = new File([blob], 'ai-generated-image.jpg', { type: 'image/jpeg' });
                
                await navigator.share({
                    title: 'AI Generated Image',
                    text: `Check out this AI-generated image: "${this.usedPrompt.textContent}"`,
                    files: [file]
                });
            } catch (error) {
                console.error('Error sharing image:', error);
                this.fallbackShare();
            }
        } else {
            this.fallbackShare();
        }
    }

    fallbackShare() {
        // Fallback sharing method
        const shareText = `Check out this AI-generated image: "${this.usedPrompt.textContent}" - Created with AI Image Generator`;
        const shareUrl = window.location.href;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
            this.showNotification('Share text copied to clipboard!');
        } else {
            // Create a temporary textarea for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = `${shareText} ${shareUrl}`;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showNotification('Share text copied to clipboard!');
        }
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'error' ? '#dc2626' : '#10b981'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIImageGenerator();
});

// Add some additional utility functions for enhanced functionality

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const generateBtn = document.getElementById('generate-btn');
        if (!generateBtn.disabled) {
            generateBtn.click();
        }
    }
});

// Add smooth scrolling for better UX
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(20px)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.input-section, .results-section');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});


