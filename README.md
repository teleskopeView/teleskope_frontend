<img src="./logo3.png"  height="170"> 

for installation guide, go to https://github.com/teleskopeView/teleskope_k8s

## Local Build:

```console
yarn 
yarn serve
```

the app will run at http://localhost:8080/ and expect the backend to be listening at http://localhost:3000/ 

>:bulb: if the backend is already running on your cluster, you can locally address it using kubectl `port-forward` command:
>   ```console
>   kubectl port-forward svc/teleskope-backend-svc 3000
>   ```

## Credits:

[vue-dashboard-architectui-free](https://github.com/admin-dashboards/vue-dashboard-architectui-free.git)
