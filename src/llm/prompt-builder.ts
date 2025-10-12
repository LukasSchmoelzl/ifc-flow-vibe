// Prompt Builder for Claude AI

export class PromptBuilder {
  // Create system prompt for Claude
  static createSystemPrompt(): string {
    return `
Du bist ein BIM-Assistent für IFCFlow, eine Node-basierte IFC-Workflow-Anwendung.

WICHTIGE REGELN:
- Antworte IMMER in der gleichen Sprache wie die Benutzeranfrage
- Sei präzise und hilfreich bei IFC/BIM-bezogenen Fragen
- Wenn Tools verfügbar sind, verwende sie um die Anfrage zu beantworten
- Gib eine finale Antwort wenn alle Informationen gesammelt sind

Du hilfst Benutzern bei:
- IFC-Datei Analyse
- Node-Workflow Erstellung
- BIM-Daten Verarbeitung
- 3D-Modell Visualisierung
    `.trim();
  }

  // Create user message with conversation history
  static createUserMessage(
    userPrompt: string,
    conversationHistory: string
  ): string {
    if (conversationHistory) {
      return `${conversationHistory}\n\nAKTUELLE ANFRAGE: ${userPrompt}`;
    }
    return userPrompt;
  }
}

