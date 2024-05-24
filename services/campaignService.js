const { nanoid } = require('nanoid');
const QRCode = require('qrcode');

/**
 * Função para gerar um link único para uma campanha
 * @returns {string} - Link único gerado
 */
function generateUniqueLink() {
  return `http://yourdomain.com/campaign/${nanoid()}`;
}

/**
 * Função para gerar um QR Code a partir de um link
 * @param {string} link - Link para o qual o QR Code será gerado
 * @returns {Promise<string>} - Promise que resolve para o QR Code gerado em formato de data URL
 */
async function generateQRCode(link) {
  try {
    return await QRCode.toDataURL(link);
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
}

module.exports = {
  generateUniqueLink,
  generateQRCode
};

