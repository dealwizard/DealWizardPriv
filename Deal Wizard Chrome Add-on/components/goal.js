import LoggerFactory from '../tools/logger.js';
import GoalStorage from './goalStorage.js';

const logger = LoggerFactory.getLogger('DEAL-WIZARD/GOAL');
logger.trace('Goal.js loaded');

class Goal {
    constructor(container) {
        logger.trace('Goal constructor called');
        this.container = container;
        this.goalValue = '';
        this.render();
        this.setupEventListeners();
        this.initialize();
    }

    async initialize() {
        logger.trace('Initializing Goal component');
        // Load saved goal if exists
        const savedGoal = await GoalStorage.getGoal();
        if (savedGoal) {
            this.goalValue = savedGoal;
            const input = document.querySelector('#goal-input');
            if (input) {
                input.value = savedGoal;
                window.currentGoal = savedGoal;
            }
            logger.trace('Loaded saved goal:', savedGoal);
        }

        // Set up storage change listener
        GoalStorage.onGoalChange((newGoal) => {
            logger.trace('Goal changed in storage:', newGoal);
            this.goalValue = newGoal || '';
            const input = document.querySelector('#goal-input');
            if (input) {
                input.value = this.goalValue;
                window.currentGoal = this.goalValue;
            }
        });
    }

    setupEventListeners() {
        // Listen for goal value requests
        document.addEventListener('getGoalValue', (event) => {
            logger.trace('Received request for goal value:', event.detail);
            window.currentGoal = this.goalValue;
            // Dispatch event with goal value
            const goalEvent = new CustomEvent('wizardClickWithGoal', {
                bubbles: true,
                detail: { goal: this.goalValue }
            });
            document.dispatchEvent(goalEvent);
            logger.trace('Set and dispatched current goal value:', this.goalValue);
            
            // Disable the goal input after wizard click
            this.disableGoalInput();
        });

        // Listen for input changes
        const input = document.querySelector('#goal-input');
        if (input) {
            input.addEventListener('change', this.handleGoalChange.bind(this));
            input.addEventListener('input', async (event) => {
                this.goalValue = event.target.value;
                window.currentGoal = this.goalValue;
                // Save to storage
                await GoalStorage.saveGoal(this.goalValue);
                logger.trace('Updated and saved goal value:', this.goalValue);
            });
        }
    }

    disableGoalInput() {
        const input = document.querySelector('#goal-input');
        if (input) {
            input.disabled = true;
            input.style.backgroundColor = '#f5f5f5';
            input.style.cursor = 'not-allowed';
            // Clear placeholder if input is empty
            if (!input.value) {
                input.placeholder = '';
            }
            logger.trace('Goal input disabled');
        }
    }

    async handleGoalChange(event) {
        this.goalValue = event.target.value;
        window.currentGoal = this.goalValue;
        // Save to storage
        await GoalStorage.saveGoal(this.goalValue);
        logger.trace('Goal changed and saved:', this.goalValue);

        const goalData = {
            goal: this.goalValue
        };

        logger.trace('Dispatching goalchange event with data:', goalData);
        const customEvent = new CustomEvent('goalchange', {
            detail: goalData,
            bubbles: true
        });
        event.target.dispatchEvent(customEvent);
    }

    render() {
        logger.trace('Rendering Goal component');
        
        // Create icon container
        const iconContainer = document.createElement('div');
        iconContainer.className = 'goal-icon-container';
        
        // Create icon
        const icon = document.createElement('img');
        icon.src = chrome.runtime.getURL('Assets/goal.png');
        icon.className = 'goal-icon';
        icon.alt = 'Goal';
        
        // Add entrance animation after a small delay
        setTimeout(() => {
            iconContainer.classList.add('show-icon');
        }, 500);
        
        // Create input container
        const inputContainer = document.createElement('div');
        inputContainer.className = 'goal-input-container';
        
        const content = document.createElement('div');
        content.className = 'goal-content';
        
        const item = document.createElement('div');
        item.className = 'goal-item';
        
        const label = document.createElement('label');
        label.textContent = 'Goal:';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'goal-input';
        input.placeholder = 'Enter your investment goal';
        
        // Add event listeners
        input.addEventListener('change', this.handleGoalChange.bind(this));
        
        let isHoveringIcon = false;
        let isHoveringInput = false;
        
        // Add hover event listeners
        iconContainer.addEventListener('mouseenter', () => {
            logger.trace('Icon container mouse enter');
            isHoveringIcon = true;
            inputContainer.classList.add('expanded');
            
            // Check if wizard is visible
            const wizardIcon = document.querySelector('#rm-hover-icon:not(.rm-transition-out)');
            if (wizardIcon) {
                iconContainer.classList.add('scale-up');
                icon.classList.add('glow');
            }
        });
        
        iconContainer.addEventListener('mouseleave', () => {
            logger.trace('Icon container mouse leave');
            isHoveringIcon = false;
            // Hide only if not hovering over input container
            setTimeout(() => {
                if (!isHoveringIcon && !isHoveringInput) {
                    inputContainer.classList.remove('expanded');
                    iconContainer.classList.remove('scale-up');
                    icon.classList.remove('glow');
                }
            }, 100);
        });
        
        inputContainer.addEventListener('mouseenter', () => {
            logger.trace('Input container mouse enter');
            isHoveringInput = true;
            inputContainer.classList.add('expanded');
        });
        
        inputContainer.addEventListener('mouseleave', (event) => {
            logger.trace('Input container mouse leave');
            isHoveringInput = false;
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            
            setTimeout(() => {
                // Check if mouse is over deal icon
                const dealIcon = document.querySelector('.deal-ready');
                if (dealIcon) {
                    const dealRect = dealIcon.getBoundingClientRect();
                    if (mouseX >= dealRect.left && mouseX <= dealRect.right && 
                        mouseY >= dealRect.top && mouseY <= dealRect.bottom) {
                        // Keep expanded if hovering over deal icon
                        return;
                    }
                }
                
                // Only collapse if not hovering over either component
                if (!isHoveringIcon && !isHoveringInput) {
                    inputContainer.classList.remove('expanded');
                    iconContainer.classList.remove('scale-up');
                    icon.classList.remove('glow');
                }
            }, 100);
        });
        
        // Construct the DOM
        iconContainer.appendChild(icon);
        
        item.appendChild(label);
        item.appendChild(input);
        content.appendChild(item);
        inputContainer.appendChild(content);
        
        // Add to container
        this.container.appendChild(inputContainer);
        this.container.appendChild(iconContainer);
        
        logger.trace('Goal component rendered');
    }
}

export default Goal; 