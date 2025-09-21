import http from 'k6/http'
import { sleep } from 'k6'
export const options = {
  vus: 10,
  duration: '30s',
  thresholds: { http_req_duration: ['p(95)<2000'] }
}
export default function() {
  const base = __ENV.BASE_URL || 'http://localhost:3000/api/v1'
  http.get(`${base}/search?q=policy`)
  sleep(1)
}

