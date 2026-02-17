/**
 * Test script to verify the OverheadProfitMasterReader error handling
 */

import { OverheadProfitMasterReader } from '../test-data/overhead-profit-master-reader'

console.log('Testing OverheadProfitMasterReader...')
const reader = OverheadProfitMasterReader.getInstance()

console.log('\nChecking loaded data:')
console.log('- FGICC records:', reader.getAllFgiccMaster().length)
console.log('- ICC records:', reader.getAllIccMaster().length)
console.log('- Payment records:', reader.getAllPaymentMaster().length)
console.log('- MOH records:', reader.getAllMohMaster().length)
console.log('- FOH records:', reader.getAllFohMaster().length)
console.log('- SGA records:', reader.getAllSgaMaster().length)
console.log('- Profit records:', reader.getAllProfitMaster().length)
console.log('- Packing Material records:', reader.getAllPackingMaterialMaster().length)
console.log('- Container Size records:', reader.getAllContainerSizeMaster().length)
console.log('- Logistics Rate Card records:', reader.getAllLogisticsRateCardMaster().length)

console.log('\nTest complete!')
