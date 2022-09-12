interface Endpoint {
  serviceId: string;
  username: string;
  password: string;
}

const pullIncrementalUpdates = async (endpoint: Endpoint) => {
  console.log('Pull from endpoint', endpoint);
  const res = await window.crawler.pullList(
    endpoint.serviceId,
    endpoint.username,
    endpoint.password,
    undefined
  );
  console.log(res);
};

export default {
  pullIncrementalUpdates,
};
