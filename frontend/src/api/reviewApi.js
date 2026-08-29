import axios from 'axios';

const reviewApi = axios.create({
  baseURL: 'https://eyouth-30901091601518-shopsphere-review.vercel.app/api',
});

export default reviewApi;