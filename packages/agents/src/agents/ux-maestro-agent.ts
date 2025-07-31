import { BaseAgent } from './base-agent';
import { AgentType, Task, Result, TaskPriority } from '@aris/shared';
import { OpenAIService, LLMConfig } from '@aris/llm';

export interface DesignSystem {
  id: string;
  name: string;
  colorPalette: ColorPalette;
  typography: TypographySystem;
  spacing: SpacingSystem;
  components: ComponentLibrary;
  userFlows: UserFlow[];
  responsiveBreakpoints: ResponsiveBreakpoints;
  accessibility: AccessibilityGuidelines;
  brandGuidelines: BrandGuidelines;
}

export interface ColorPalette {
  primary: ColorScheme;
  secondary: ColorScheme;
  neutral: ColorScheme;
  semantic: SemanticColors;
  gradients: GradientPalette;
}

export interface ColorScheme {
  main: string;
  light: string;
  dark: string;
  contrast: string;
}

export interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface GradientPalette {
  primary: string[];
  secondary: string[];
  accent: string[];
}

export interface TypographySystem {
  fontFamily: FontFamily;
  fontSize: FontSizeScale;
  fontWeight: FontWeightScale;
  lineHeight: LineHeightScale;
  letterSpacing: LetterSpacingScale;
}

export interface FontFamily {
  primary: string;
  secondary: string;
  monospace: string;
}

export interface FontSizeScale {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
}

export interface FontWeightScale {
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
}

export interface LineHeightScale {
  tight: string;
  normal: string;
  relaxed: string;
  loose: string;
}

export interface LetterSpacingScale {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
}

export interface SpacingSystem {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface ComponentLibrary {
  buttons: ButtonStyles;
  inputs: InputStyles;
  cards: CardStyles;
  modals: ModalStyles;
  navigation: NavigationStyles;
  forms: FormStyles;
  tables: TableStyles;
  charts: ChartStyles;
}

export interface ButtonStyles {
  primary: ButtonVariant;
  secondary: ButtonVariant;
  outline: ButtonVariant;
  ghost: ButtonVariant;
  destructive: ButtonVariant;
}

export interface ButtonVariant {
  backgroundColor: string;
  color: string;
  borderColor: string;
  borderRadius: string;
  padding: string;
  fontSize: string;
  fontWeight: number;
  hover: {
    backgroundColor: string;
    color: string;
    borderColor: string;
  };
  active: {
    backgroundColor: string;
    color: string;
    borderColor: string;
  };
  disabled: {
    backgroundColor: string;
    color: string;
    borderColor: string;
  };
}

export interface InputStyles {
  default: InputVariant;
  error: InputVariant;
  success: InputVariant;
  disabled: InputVariant;
}

export interface InputVariant {
  backgroundColor: string;
  color: string;
  borderColor: string;
  borderRadius: string;
  padding: string;
  fontSize: string;
  placeholderColor: string;
  focus: {
    borderColor: string;
    boxShadow: string;
  };
}

export interface CardStyles {
  default: CardVariant;
  elevated: CardVariant;
  outlined: CardVariant;
}

export interface CardVariant {
  backgroundColor: string;
  borderColor: string;
  borderRadius: string;
  padding: string;
  boxShadow: string;
}

export interface ModalStyles {
  overlay: {
    backgroundColor: string;
    backdropFilter: string;
  };
  content: {
    backgroundColor: string;
    borderRadius: string;
    padding: string;
    boxShadow: string;
  };
}

export interface NavigationStyles {
  primary: NavigationVariant;
  secondary: NavigationVariant;
  mobile: NavigationVariant;
}

export interface NavigationVariant {
  backgroundColor: string;
  color: string;
  activeColor: string;
  hoverColor: string;
  padding: string;
  fontSize: string;
}

export interface FormStyles {
  fieldGroup: {
    marginBottom: string;
  };
  label: {
    color: string;
    fontSize: string;
    fontWeight: number;
    marginBottom: string;
  };
  error: {
    color: string;
    fontSize: string;
    marginTop: string;
  };
}

export interface TableStyles {
  header: {
    backgroundColor: string;
    color: string;
    fontWeight: number;
  };
  row: {
    backgroundColor: string;
    borderColor: string;
  };
  cell: {
    padding: string;
    fontSize: string;
  };
}

export interface ChartStyles {
  colors: string[];
  backgroundColor: string;
  gridColor: string;
  textColor: string;
}

export interface UserFlow {
  id: string;
  name: string;
  description: string;
  steps: UserFlowStep[];
  screens: UserFlowScreen[];
  interactions: UserFlowInteraction[];
}

export interface UserFlowStep {
  id: string;
  name: string;
  description: string;
  screenId: string;
  actions: string[];
  conditions: string[];
}

export interface UserFlowScreen {
  id: string;
  name: string;
  description: string;
  components: string[];
  layout: string;
  interactions: string[];
}

export interface UserFlowInteraction {
  id: string;
  from: string;
  to: string;
  trigger: string;
  condition: string;
  animation: string;
}

export interface ResponsiveBreakpoints {
  mobile: string;
  tablet: string;
  desktop: string;
  wide: string;
}

export interface AccessibilityGuidelines {
  colorContrast: {
    minimum: number;
    enhanced: number;
  };
  focusIndicators: {
    visible: boolean;
    style: string;
  };
  keyboardNavigation: {
    enabled: boolean;
    tabOrder: string[];
  };
  screenReader: {
    labels: boolean;
    descriptions: boolean;
    landmarks: boolean;
  };
}

export interface BrandGuidelines {
  logo: {
    primary: string;
    secondary: string;
    usage: string[];
  };
  voice: {
    tone: string;
    personality: string;
    examples: string[];
  };
  imagery: {
    style: string;
    colorTreatment: string;
    composition: string;
  };
}

export class UXMaestroAgent extends BaseAgent {
  private llmService?: OpenAIService;

  /**
   * Helper method to make LLM requests with proper error handling
   */
  private async makeLLMRequest(prompt: string, taskType: string = 'analysis'): Promise<any> {
    if (!this.llmService) {
      throw new Error('LLM service not initialized');
    }

    const response = await this.llmService.processTask({
      id: `${taskType}-${Date.now()}`,
      type: taskType,
      description: `LLM request for ${taskType}`,
      data: { prompt },
      priority: TaskPriority.HIGH
    });

    if (!response.success) {
      throw new Error(response.error || `Failed to process ${taskType} request`);
    }

    return JSON.parse(response.data);
  }

  constructor() {
    super(
      'ux-maestro-agent',
      AgentType.UX_MAESTRO,
      'UX Maestro',
      'Design System and User Experience Specialist',
      [
        'design_system_creation',
        'user_flow_design',
        'color_palette_design',
        'typography_design',
        'component_library',
        'accessibility_design',
        'responsive_design',
        'brand_guidelines',
        'user_research',
        'prototype_creation'
      ]
    );
  }

  /**
   * Initialize the LLM service
   */
  public async initializeLLM(config: LLMConfig): Promise<void> {
    this.llmService = new OpenAIService(config);
  }

  public async processTask(task: Task): Promise<Result<any>> {
    try {
      console.log(`UX-Maestro processing task: ${task.type}`);

      switch (task.type) {
        case 'create-design-system':
          return await this.createDesignSystem(task);
        case 'design-user-flows':
          return await this.designUserFlows(task);
        case 'create-color-palette':
          return await this.createColorPalette(task);
        case 'design-typography':
          return await this.designTypography(task);
        case 'create-component-library':
          return await this.createComponentLibrary(task);
        case 'design-accessibility':
          return await this.designAccessibility(task);
        case 'create-responsive-design':
          return await this.createResponsiveDesign(task);
        case 'create-brand-guidelines':
          return await this.createBrandGuidelines(task);
        case 'conduct-user-research':
          return await this.conductUserResearch(task);
        case 'create-prototype':
          return await this.createPrototype(task);
        default:
          return { success: false, error: `Unknown task type: ${task.type}` };
      }
    } catch (error) {
      return { success: false, error: `UX-Maestro agent error: ${error}` };
    }
  }

  private async createDesignSystem(task: Task): Promise<Result<DesignSystem>> {
    const { clientVision, requirements, brandGuidelines } = task.data || {};

    if (!clientVision) {
      return { success: false, error: 'Client vision not provided' };
    }

    try {
      const colorPalette = await this.createColorPaletteFromVision(clientVision, brandGuidelines);
      const typography = await this.designTypographyFromVision(clientVision);
      const spacing = await this.createSpacingSystem(clientVision);
      const components = await this.createComponentLibraryFromVision(clientVision);
      const userFlows = await this.designUserFlowsFromVision(clientVision, requirements);
      const responsiveBreakpoints = await this.createResponsiveBreakpoints(clientVision);
      const accessibility = await this.designAccessibilityGuidelines(clientVision);
      const brand = await this.createBrandGuidelinesFromVision(clientVision, brandGuidelines);

      const designSystem: DesignSystem = {
        id: `design_system_${Date.now()}`,
        name: 'Generated Design System',
        colorPalette,
        typography,
        spacing,
        components,
        userFlows,
        responsiveBreakpoints,
        accessibility,
        brandGuidelines: brand
      };

      return { success: true, data: designSystem };
    } catch (error) {
      return { success: false, error: `Failed to create design system: ${error}` };
    }
  }

  private async designUserFlows(task: Task): Promise<Result<UserFlow[]>> {
    const { clientVision, requirements, userPersonas } = task.data || {};

    if (!clientVision) {
      return { success: false, error: 'Client vision not provided' };
    }

    try {
      const userFlows = await this.designUserFlowsFromVision(clientVision, requirements, userPersonas);
      return { success: true, data: userFlows };
    } catch (error) {
      return { success: false, error: `Failed to design user flows: ${error}` };
    }
  }

  private async createColorPalette(task: Task): Promise<Result<ColorPalette>> {
    const { clientVision, brandGuidelines, mood } = task.data || {};

    if (!clientVision) {
      return { success: false, error: 'Client vision not provided' };
    }

    try {
      const colorPalette = await this.createColorPaletteFromVision(clientVision, brandGuidelines, mood);
      return { success: true, data: colorPalette };
    } catch (error) {
      return { success: false, error: `Failed to create color palette: ${error}` };
    }
  }

  private async designTypography(task: Task): Promise<Result<TypographySystem>> {
    const { clientVision, brandGuidelines } = task.data || {};

    if (!clientVision) {
      return { success: false, error: 'Client vision not provided' };
    }

    try {
      const typography = await this.designTypographyFromVision(clientVision, brandGuidelines);
      return { success: true, data: typography };
    } catch (error) {
      return { success: false, error: `Failed to design typography: ${error}` };
    }
  }

  private async createComponentLibrary(task: Task): Promise<Result<ComponentLibrary>> {
    const { clientVision, designSystem } = task.data || {};

    if (!clientVision) {
      return { success: false, error: 'Client vision not provided' };
    }

    try {
      const components = await this.createComponentLibraryFromVision(clientVision, designSystem);
      return { success: true, data: components };
    } catch (error) {
      return { success: false, error: `Failed to create component library: ${error}` };
    }
  }

  private async designAccessibility(task: Task): Promise<Result<AccessibilityGuidelines>> {
    const { clientVision, userPersonas } = task.data || {};

    if (!clientVision) {
      return { success: false, error: 'Client vision not provided' };
    }

    try {
      const accessibility = await this.designAccessibilityGuidelines(clientVision, userPersonas);
      return { success: true, data: accessibility };
    } catch (error) {
      return { success: false, error: `Failed to design accessibility guidelines: ${error}` };
    }
  }

  private async createResponsiveDesign(task: Task): Promise<Result<ResponsiveBreakpoints>> {
    const { clientVision, targetDevices } = task.data || {};

    if (!clientVision) {
      return { success: false, error: 'Client vision not provided' };
    }

    try {
      const responsiveBreakpoints = await this.createResponsiveBreakpoints(clientVision, targetDevices);
      return { success: true, data: responsiveBreakpoints };
    } catch (error) {
      return { success: false, error: `Failed to create responsive design: ${error}` };
    }
  }

  private async createBrandGuidelines(task: Task): Promise<Result<BrandGuidelines>> {
    const { clientVision, existingBrand } = task.data || {};

    if (!clientVision) {
      return { success: false, error: 'Client vision not provided' };
    }

    try {
      const brandGuidelines = await this.createBrandGuidelinesFromVision(clientVision, existingBrand);
      return { success: true, data: brandGuidelines };
    } catch (error) {
      return { success: false, error: `Failed to create brand guidelines: ${error}` };
    }
  }

  private async conductUserResearch(task: Task): Promise<Result<any>> {
    const { clientVision, targetAudience } = task.data || {};

    if (!clientVision) {
      return { success: false, error: 'Client vision not provided' };
    }

    try {
      const researchPlan = await this.createUserResearchPlan(clientVision, targetAudience);
      const personas = await this.createUserPersonas(clientVision, targetAudience);
      const journeyMaps = await this.createUserJourneyMaps(clientVision, personas);

      return { 
        success: true, 
        data: { researchPlan, personas, journeyMaps } 
      };
    } catch (error) {
      return { success: false, error: `Failed to conduct user research: ${error}` };
    }
  }

  private async createPrototype(task: Task): Promise<Result<any>> {
    const { designSystem, userFlows, requirements } = task.data || {};

    if (!designSystem) {
      return { success: false, error: 'Design system not provided' };
    }

    try {
      const prototype = await this.createInteractivePrototype(designSystem, userFlows, requirements);
      return { success: true, data: prototype };
    } catch (error) {
      return { success: false, error: `Failed to create prototype: ${error}` };
    }
  }

  // Design System Creation Methods
  private async createColorPaletteFromVision(
    clientVision: string, 
    brandGuidelines?: any, 
    mood?: string
  ): Promise<ColorPalette> {
    const prompt = `Create a color palette for this project:
    
    Vision: ${clientVision}
    Brand Guidelines: ${JSON.stringify(brandGuidelines || {})}
    Mood: ${mood || 'professional'}
    
    Design a comprehensive color palette including:
    - Primary and secondary colors
    - Neutral color scheme
    - Semantic colors (success, warning, error, info)
    - Gradient options
    
    Return as a ColorPalette JSON object.`;
    
    return await this.makeLLMRequest(prompt, 'color-palette-design');
  }

  private async designTypographyFromVision(
    clientVision: string, 
    brandGuidelines?: any
  ): Promise<TypographySystem> {
    const prompt = `Design typography system for this project:
    
    Vision: ${clientVision}
    Brand Guidelines: ${JSON.stringify(brandGuidelines || {})}
    
    Create a typography system including:
    - Font family selection
    - Font size scale
    - Font weight scale
    - Line height scale
    - Letter spacing scale
    
    Return as a TypographySystem JSON object.`;
    
    return await this.makeLLMRequest(prompt, 'typography-design');
  }

  private async createSpacingSystem(clientVision: string): Promise<SpacingSystem> {
    const prompt = `Create a spacing system for this project:
    
    Vision: ${clientVision}
    
    Design a consistent spacing system including:
    - Base spacing unit
    - Scale progression
    - Component spacing
    - Layout spacing
    
    Return as a SpacingSystem JSON object.`;
    
    return await this.makeLLMRequest(prompt, 'spacing-system');
  }

  private async createComponentLibraryFromVision(
    clientVision: string, 
    designSystem?: any
  ): Promise<ComponentLibrary> {
    const prompt = `Create a component library for this project:
    
    Vision: ${clientVision}
    Design System: ${JSON.stringify(designSystem || {})}
    
    Design a comprehensive component library including:
    - Button styles and variants
    - Input styles and states
    - Card components
    - Modal components
    - Navigation components
    - Form components
    - Table components
    - Chart components
    
    Return as a ComponentLibrary JSON object.`;
    
    return await this.makeLLMRequest(prompt, 'component-library');
  }

  private async designUserFlowsFromVision(
    clientVision: string, 
    requirements?: any, 
    userPersonas?: any
  ): Promise<UserFlow[]> {
    const prompt = `Design user flows for this project:
    
    Vision: ${clientVision}
    Requirements: ${JSON.stringify(requirements || {})}
    User Personas: ${JSON.stringify(userPersonas || [])}
    
    Create user flows including:
    - User journey maps
    - Screen flows
    - Interaction patterns
    - Navigation paths
    - User goals and tasks
    
    Return as an array of UserFlow JSON objects.`;
    
    return await this.makeLLMRequest(prompt, 'user-flow-design');
  }

  private async createResponsiveBreakpoints(
    clientVision: string, 
    targetDevices?: any
  ): Promise<ResponsiveBreakpoints> {
    const prompt = `Create responsive breakpoints for this project:
    
    Vision: ${clientVision}
    Target Devices: ${JSON.stringify(targetDevices || {})}
    
    Design responsive breakpoints for:
    - Mobile devices
    - Tablet devices
    - Desktop screens
    - Wide screens
    
    Return as a ResponsiveBreakpoints JSON object.`;
    
    return await this.makeLLMRequest(prompt, 'responsive-breakpoints');
  }

  private async designAccessibilityGuidelines(
    clientVision: string, 
    userPersonas?: any
  ): Promise<AccessibilityGuidelines> {
    const prompt = `Design accessibility guidelines for this project:
    
    Vision: ${clientVision}
    User Personas: ${JSON.stringify(userPersonas || [])}
    
    Create accessibility guidelines including:
    - Color contrast requirements
    - Focus indicators
    - Keyboard navigation
    - Screen reader support
    - WCAG compliance
    
    Return as an AccessibilityGuidelines JSON object.`;
    
    return await this.makeLLMRequest(prompt, 'accessibility-guidelines');
  }

  private async createBrandGuidelinesFromVision(
    clientVision: string, 
    existingBrand?: any
  ): Promise<BrandGuidelines> {
    const prompt = `Create brand guidelines for this project:
    
    Vision: ${clientVision}
    Existing Brand: ${JSON.stringify(existingBrand || {})}
    
    Design brand guidelines including:
    - Logo usage and variations
    - Brand voice and tone
    - Imagery style and treatment
    - Brand personality
    - Usage examples
    
    Return as a BrandGuidelines JSON object.`;
    
    return await this.makeLLMRequest(prompt, 'brand-guidelines');
  }

  // User Research Methods
  private async createUserResearchPlan(clientVision: string, targetAudience?: any): Promise<any> {
    const prompt = `Create a user research plan for this project:
    
    Vision: ${clientVision}
    Target Audience: ${JSON.stringify(targetAudience || {})}
    
    Design a user research plan including:
    - Research objectives
    - Methodology
    - Participant criteria
    - Research questions
    - Timeline and deliverables
    
    Return as a user research plan object.`;
    
    return await this.makeLLMRequest(prompt, 'user-research-plan');
  }

  private async createUserPersonas(clientVision: string, targetAudience?: any): Promise<any[]> {
    const prompt = `Create user personas for this project:
    
    Vision: ${clientVision}
    Target Audience: ${JSON.stringify(targetAudience || {})}
    
    Create detailed user personas including:
    - Demographics
    - Goals and motivations
    - Pain points
    - Behaviors and preferences
    - Technical proficiency
    
    Return as an array of user persona objects.`;
    
    return await this.makeLLMRequest(prompt, 'user-personas');
  }

  private async createUserJourneyMaps(clientVision: string, personas: any[]): Promise<any[]> {
    const prompt = `Create user journey maps for this project:
    
    Vision: ${clientVision}
    Personas: ${JSON.stringify(personas)}
    
    Create user journey maps including:
    - User touchpoints
    - Emotional journey
    - Pain points and opportunities
    - Service interactions
    - Decision points
    
    Return as an array of user journey map objects.`;
    
    return await this.makeLLMRequest(prompt, 'user-journey-maps');
  }

  // Prototype Creation
  private async createInteractivePrototype(
    designSystem: DesignSystem, 
    userFlows: UserFlow[], 
    requirements: any
  ): Promise<any> {
    const prompt = `Create an interactive prototype for this project:
    
    Design System: ${JSON.stringify(designSystem)}
    User Flows: ${JSON.stringify(userFlows)}
    Requirements: ${JSON.stringify(requirements)}
    
    Create an interactive prototype including:
    - Screen designs
    - User interactions
    - Navigation flows
    - Component states
    - Responsive behavior
    
    Return as an interactive prototype object.`;
    
    return await this.makeLLMRequest(prompt, 'interactive-prototype');
  }
} 