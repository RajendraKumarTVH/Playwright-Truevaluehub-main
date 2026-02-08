import fs from 'fs'

export default async () => {
	if (!fs.existsSync('auth_spec.json')) {
		throw new Error('❌ auth_spec.json missing. Run auth setup locally.')
	}
}
