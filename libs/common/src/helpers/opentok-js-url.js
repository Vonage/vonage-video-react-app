/**
 * Returns the opentokJsUrl domain for the environment defined in the config
 * @param {String} tbEnv - Valid values are `tbdev`, `tbrel`, `vapir` and `prod` (default).
 * @returns {String}
 */
const getJsUrlDomain = (tbEnv) => {
  switch ((tbEnv || '').toLowerCase()) {
    case 'vapir':
      return 'www.rel.tokbox.com';
    case 'vapid':
      return 'www.dev.tokbox.com';
    default:
      return 'static.opentok.com';
  }
};

/**
 * Returns the opentokJsUrl for the environment defined in the config
 * @param {String} tbEnv - Valid values are `tbdev`, `tbrel` and `prod` (default).
 * @param {String} sdkVersion - JS SDK Version. iE: 2.18
 * @returns {String}
 */
const getJsUrl = (tbEnv, sdkVersion) => {
  const domain = getJsUrlDomain(tbEnv);
  return `https://${domain}/v${sdkVersion || '2'}/js/opentok.min.js`;
};

module.exports = {
  getJsUrlDomain,
  getJsUrl,
};
