import L from 'leaflet'

import icon2x from 'leaflet/dist/images/marker-icon-2x.png'
import icon from 'leaflet/dist/images/marker-icon.png'
import shadow from 'leaflet/dist/images/marker-shadow.png'

export function setupLeafletIcons() {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: icon2x,
    iconUrl: icon,
    shadowUrl: shadow,
  })
}

