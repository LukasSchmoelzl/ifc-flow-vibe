Allgemein:
    erstelle readme oder .md dateien nur wenn danach gefragt wird
    Entferne fallback logik. Fallbacks führen zu unerwartetten Verhalten, Erzeugen komplexität und sind Fehlerquellen.
    Hardcoded Werte sollen am Anfang der Datei stehen. und in GROßBUCHSTABEN
    Dokumentation wird über .md Dateien erstellt. Diese sind oft veraltet und nicht mehr aktuell.
    Vermeide SetTimeouts. Diese sind schwer zu debuggen und verursachen unerwartetes Verhalten.
    Füge nur Code Hinzu der auch direkt verwendet wird.
    Verwende unter keinen umständen MOCKDATA
    Kommentare in dem nachfolgenden Fromat sollen auf eine Zeile gekürzt werden (// Kommentar): 
    /**
    * Schlechter Kommentar
    */

    Domain-based architecture
    YAGNI
    Dateinamen sollen zum codeinhalt passen.
    verwende zustand statt hooks

Nodes:
    In jedem node UI sollen die Eingänge und Ausgänge jeweils als Liste mit Datentyp oder API call als Inhalt

Logging:
    Workflow-Level: 2 Logs (Start, Ende)
    Node-Level: 2 Logs pro Node (Start mit Input, Ende mit Output)
    Format: ▶️  nodeType (input: ...) und ✓ output: ...
    Keine Debug-Logs, nur Fehler mit ❌ NodeType:
    