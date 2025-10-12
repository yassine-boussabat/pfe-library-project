const checkServices = async () => {
  const services = [];
  
  try {
    // Check Ollama/Local AI Service
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
    // Check Google Drive Service
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

  // Log service statuses
  services.forEach(service => {
    const icon = service.status === 'connected' || service.status === 'enabled' ? '✅' : 
                 service.status === 'error' ? '❌' : '⚠️';
    console.log(`${icon} ${service.name}: ${service.status}`);
    if (service.error) {
      console.log(`   Error: ${service.error}`);
    }
  });

  // Check if any critical services failed
  const criticalFailures = services.filter(s => s.critical && s.status === 'error');
  if (criticalFailures.length > 0) {
    console.warn('⚠️ Some critical services are unavailable, but server will continue');
  }

  return services;
};

module.exports = { checkServices };
