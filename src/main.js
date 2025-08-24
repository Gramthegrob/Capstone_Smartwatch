import './style.css';

// Simple stress detection without external dependencies
class StressDetector {
    constructor() {
        this.isModelReady = true;
    }

    // Simulate LSTM prediction with physiological rules
    predict(heartRate, respiration) {
        // Normalize inputs (simple min-max scaling)
        const hrNorm = (heartRate - 40) / (200 - 40);
        const respNorm = (respiration - 8) / (40 - 8);
        
        // Simple stress calculation based on physiological thresholds
        let stressScore = 0;
        
        // Heart rate contribution
        if (heartRate > 100) stressScore += 0.4;
        else if (heartRate > 85) stressScore += 0.2;
        else if (heartRate < 60) stressScore += 0.1;
        
        // Respiration contribution
        if (respiration > 25) stressScore += 0.4;
        else if (respiration > 20) stressScore += 0.2;
        else if (respiration < 12) stressScore += 0.1;
        
        // Add some variation based on normalized values
        stressScore += (hrNorm * 0.3) + (respNorm * 0.3);
        
        // Ensure score is between 0 and 1
        stressScore = Math.min(1, Math.max(0, stressScore));
        
        // Add some randomness to simulate model uncertainty
        const confidence = 0.7 + (Math.random() * 0.25);
        
        return {
            stressLevel: stressScore,
            confidence: confidence,
            isStressed: stressScore > 0.5
        };
    }
}

// Simple chart implementation without Chart.js
class SimpleChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.data = [];
        this.setupCanvas();
    }
    
    setupCanvas() {
        this.canvas.width = 600;
        this.canvas.height = 300;
    }
    
    addDataPoint(heartRate, respiration, stress) {
        this.data.push({ heartRate, respiration, stress, time: Date.now() });
        if (this.data.length > 20) {
            this.data.shift();
        }
        this.draw();
    }
    
    draw() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        if (this.data.length < 2) return;
        
        // Draw grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const y = (height / 10) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw heart rate line
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        this.data.forEach((point, index) => {
            const x = (width / (this.data.length - 1)) * index;
            const y = height - ((point.heartRate - 40) / (200 - 40)) * height;
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
        
        // Draw respiration line
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        this.data.forEach((point, index) => {
            const x = (width / (this.data.length - 1)) * index;
            const y = height - ((point.respiration - 8) / (40 - 8)) * height;
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
        
        // Draw legend
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.fillText('Heart Rate', 10, 20);
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(90, 10, 20, 10);
        
        ctx.fillStyle = '#333';
        ctx.fillText('Respiration', 10, 40);
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(90, 30, 20, 10);
    }
}

// Main application
class App {
    constructor() {
        this.detector = new StressDetector();
        this.chart = new SimpleChart('dataChart');
        this.initializeUI();
    }
    
    initializeUI() {
        const predictBtn = document.getElementById('predictBtn');
        const heartRateInput = document.getElementById('heartRate');
        const respirationInput = document.getElementById('respiration');
        
        predictBtn.addEventListener('click', () => {
            this.makePrediction();
        });
        
        // Allow Enter key to trigger prediction
        [heartRateInput, respirationInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.makePrediction();
                }
            });
        });
    }
    
    makePrediction() {
        const heartRate = parseFloat(document.getElementById('heartRate').value);
        const respiration = parseFloat(document.getElementById('respiration').value);
        
        // Validate inputs
        if (!heartRate || !respiration || heartRate < 40 || heartRate > 200 || respiration < 8 || respiration > 40) {
            alert('Please enter valid heart rate (40-200 BPM) and respiration (8-40 breaths/min) values.');
            return;
        }
        
        // Make prediction
        const result = this.detector.predict(heartRate, respiration);
        
        // Update UI
        this.updateResults(result, heartRate, respiration);
        
        // Add to chart
        this.chart.addDataPoint(heartRate, respiration, result.stressLevel);
        
        // Show results section
        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    }
    
    updateResults(result, heartRate, respiration) {
        const stressText = document.getElementById('stressText');
        const confidence = document.getElementById('confidence');
        const meterFill = document.getElementById('meterFill');
        const stressLevel = document.getElementById('stressLevel');
        
        // Update stress level text and color
        const stressPercentage = Math.round(result.stressLevel * 100);
        const confidencePercentage = Math.round(result.confidence * 100);
        
        if (result.isStressed) {
            stressText.textContent = `High Stress (${stressPercentage}%)`;
            stressLevel.className = 'stress-level high-stress';
        } else {
            stressText.textContent = `Low Stress (${stressPercentage}%)`;
            stressLevel.className = 'stress-level low-stress';
        }
        
        confidence.textContent = `Confidence: ${confidencePercentage}%`;
        
        // Update meter
        meterFill.style.width = `${stressPercentage}%`;
        meterFill.className = `meter-fill ${result.isStressed ? 'high-stress' : 'low-stress'}`;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});