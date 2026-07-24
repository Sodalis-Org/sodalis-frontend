'use strict'

/**
 * Compat shim: brace-expansion@5.0.8 (GHSA-mh99-v99m-4gvg) with the
 * legacy default-export function API expected by minimatch@3 / minimatch@9.
 */
const core = require('./lib/commonjs/index.js')

function braceExpansion(str, options) {
  return core.expand(str, typeof options === 'object' && options ? options : undefined)
}

braceExpansion.expand = core.expand
braceExpansion.EXPANSION_MAX = core.EXPANSION_MAX
braceExpansion.EXPANSION_MAX_LENGTH = core.EXPANSION_MAX_LENGTH
braceExpansion.default = braceExpansion

module.exports = braceExpansion
