export default function _(message) {
    const messages = {
      'fr': {
      'Open': 'Ouvrir',
      'Reset amplitude': 'Réinitialiser l’amplitude',
      'Reset window': 'Réinitialiser la fenêtre',
      'Reset filter': 'Réinitialiser le filtre',
      'New annotation': 'Nouvelle annotation'
      }
    };
    const document_language = (document && document.documentElement && document.documentElement.lang) || 'en';
    const translated = (document_language && messages[document_language] && messages[document_language][message]) || message;
    return translated;
}