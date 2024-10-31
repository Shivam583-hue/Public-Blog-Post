// If using axios
axios.defaults.withCredentials = true;

// Or for specific requests
axios.get('your-api-endpoint', {
  withCredentials: true
});

// If using fetch
fetch('your-api-endpoint', {
  credentials: 'include'
}); 