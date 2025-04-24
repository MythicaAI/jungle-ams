function routeWs(r) {
    const jobId = r.uri.slice(4); // strip /ws/

    r.subrequest(`/ws-connect/${jobId}`)
        .then(res => {
            if (res.status !== 200) {
                r.return(502, "Backend allocation failed");
                return;
            }

            const backend = JSON.parse(res.responseBody);
            const upstream = `http://${backend.host}:${backend.port}${r.uri}`;

            r.internalRedirect(upstream);
        })
        .catch(err => {
            r.error(`Routing error: ${err}`);
            r.return(500);
        });
}

export default {routeWs};