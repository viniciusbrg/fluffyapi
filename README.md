# FluffyAPI

## Requirements

This is an implementation of a college project that had the following requirements:

- CRUD REST API for some resource
- Consume some external API
- Provide content negotiation (i.e, allow endpoints to return responses in different formats, json and xml)
- One endpoint must have a protocol buffer response
- The API should be documented using OpenAPI
- The API must be consumed by a web client and a mobile client 

## What is implemented 

To fulfill these requirements, I implemented the following:

- CRUD for an Animal resource (name, about & image) using Postgres as the database
- Images for Animals are uploaded to S3/Minio and a reference to it is stored in the database
- The API consumes three external APIs to get animals images: [random duck](https://random-d.uk/), [random cats](https://cataas.com/) and [random dogs](https://shibe.online/). Using the random images and the postgres database, the API exposes an endpoint to generate a random collection of animals with their pictures, the provided animals also have random names and descriptions (except for those in the postgres database)
- Every endpoint uses the `Accept` header to define the representation for the desired resource. Every endpoint can return data in JSON (`application/json`), XML (`application/xml`) and Protocol Buffers (`application/x-protobuf`). The default format is JSON.
- The OpenAPI documentation is generated by [https://springdoc.org/](springdoc-openapi). It can generate documentation from the controllers & classes in our code. 
- A multiplatform React Native application using [https://expo.dev/](expo), which can be used on Android/iOS devices. There is also a browser version of the same application, thanks to the [react-native-web](https://necolas.github.io/react-native-web/) library which renders the react native components in the browser. Therefore, the application can run on mobile devices (using Expo Go) and also in the browser with a url.

## Running the project

### API 

First, you need to have java 17 and docker installed. Using docker, we can create a postgres and minio container that is needed by the API.

To run the postgres container, you can run the following command:

`docker run -p 5432:5432 -e POSTGRES_DB=fluffyapi -e POSTGRES_PASSWORD=mysecretpassword --rm postgres`

To run the minio container, you can run the following command:

```
docker run -d \
   -p 9000:9000 \                                                                                                                                                     
   -p 9090:9090 \
   --name minio \       
   -e "MINIO_ROOT_USER=minio" \
   -e "MINIO_ROOT_PASSWORD=miniominio" \
   quay.io/minio/minio server /data --console-address ":9090"
```
   
Before starting the API, the `animals` bucket must be created inside minio. After the container is running, you can access http://localhost:9090/login and enter the credentials defined in the minio container:
user = minio and password = miniominio. Within the admin console, you can create the animals bucket and add some objects which will be needed in the API.

After the bucket is created and there are some cute images in the bucket, you just need to change one line of configuration to ensure the image urls generated by the API match your IP Address (this could be improved, will do in an version 2.0!).

Open the `application.properties` file inside the `src/main/resources` folder. In this file, you just have to change the `s3.endpoint` variable to match your IP Address.
If your IP is like, `1.2.3.4`, then the variable would be: `s3.endpoint = http://1.2.3.4:9000`. 

Now we're ready to run the API! We can run it inside an IDE like intellij, or via the command line. 

The API uses gradle, so you can run it using gradle wrapper:

`./gradlew bootRun`

### Making your first requests

Now that the API is running, you can open the **swagger page** by browsing the URL: http://localhost:8080/swagger-ui/index.html

In the Swagger UI, you can try any request that you want and select the desired return format for it.

PS: Before creating any animal directly in the API, create the object in the minio bucket first and pass the name of the object in the bucket to successfully create it in the API.

### Running the React Native Application (Web & Mobile client)

To run the client application, first, you need to have [yarn](https://yarnpkg.com/) installed.

Go to the `react-application` folder and run the `yarn` command to install the dependencies.

Once the dependencies are installed, edit the `.env` file and change the `API_URL` to match the IP Address of your machine. This is necessary to allow reaching the API from mobile devices such as android, since they cannot access your machine by simply using 'localhost' as the address. 

If your IP is like, `1.2.3.4`, then the variable would be: `API_URL=http://1.2.3.4:8080`. 

Once the `.env` file is set, you can just run `yarn start` to run the project. 

To open it in your mobile device, install the [expo go application](https://expo.dev/client) and scan the QR Code to open the application.

To open it in your browser, simply press the `w` key to load the browser version of the application.

In the client application, you can perform some of the API operations such as the CRUD commands and generate a cute random collection of pets :D

---

### References

This project was mainly to learn some things, like how to implement content negotiation in spring boot. I also used it to learn Kotlin, which is a language that I wanted to learn more about.

**Content negotiation in spring boot articles**

https://naiyer.dev/post/2021/03/27/content-negotiation-in-spring-boot/
https://www.springboottutorial.com/spring-boot-content-negotiation-with-xml-json-representations

**HTTP message converters & ProtobufHttpMessageConverter** (provides conversion between protobuf generated classes to json, xml and... protobuf!)

https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.servlet.spring-mvc.message-converters
https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/http/converter/protobuf/ProtobufHttpMessageConverter.html

**Making protobuf generated classes work with springdoc** (by default, springdoc works neatly with Java classes. But with protobuf generated classes, it has a hard time serializing things properly. So this workaround was necessary)
https://eternalwind.github.io/tech/2022/05/20/Making-springdoc-openapi-works-with-protobuf.html

**Jitpack** (I needed to use code from one repository from github, but that project wasn't in a maven repository. [Jitpack](https://jitpack.io/) can build a project from github and offer it as a package just like it were on maven!)
https://stackoverflow.com/questions/18748436/is-it-possible-to-declare-git-repository-as-dependency-in-android-gradle

**Protobuf in spring**

https://www.baeldung.com/spring-rest-api-with-protocol-buffers

**Jpa with kotlin** (some JPA tweaks to make it work properly with kotlin)

https://jpa-buddy.com/blog/best-practices-and-common-pitfalls/

