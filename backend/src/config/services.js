const checkServices = async () => {
  const services = [];

  try {
    const localAi = require('../services/localAiService');
    const ollamaStatus = await localAi.checkOllamaConnection();
    services.push({
      name: 'Ollama AI',
      status: ollamaStatus ? 'connected' : 'disconnected',
      critical: true
    });
  } catch (error) {
    services.push({
      name: 'Ollama AI',
      status: 'error',
      error: error.message,
      critical: true
    });
  }

  try {
    const googleDriveService = require('../services/googleDriveService');
    services.push({
      name: 'Google Drive',
      status: googleDriveService.isEnabled ? 'enabled' : 'disabled',
      critical: false
    });
  } catch (error) {
    services.push({
      name: 'Google Drive',
      status: 'error',
      error: error.message,
      critical: false
    });
  }

  const criticalFailures = services.filter(s => s.critical && s.status === 'error');

  return services;
};

module.exports = { checkServices };
