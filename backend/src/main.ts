import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    const config = new DocumentBuilder()
        .setTitle("Backend")
        .setDescription("Descrizione generica")
        .setVersion("1.0")
        .build();
    const documentFactory = (): OpenAPIObject => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, documentFactory);
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
