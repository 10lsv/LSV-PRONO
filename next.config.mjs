export default {
  reactStrictMode: true,
  headers: async () => [
    {
      source: "/",
      headers: [
        {
          key: "Content-Type",
          value: "text/html; charset=utf-8"
        },
        {
          key: "X-UA-Compatible",
          value: "IE=edge"
        }
      ]
    }
  ]
};