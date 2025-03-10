import { Test, TestingModule } from "@nestjs/testing";
import User from "src/user/domain/User";
import UserDTO from "src/user/adapter/input/UserDTO";
import { JwtService } from "@nestjs/jwt";
import { LOGIN_USE_CASE } from "src/user/service/port/input/LoginUseCase";
import LoginController from "src/user/adapter/input/LoginController";
import { MongooseError } from "mongoose";
import { HttpException, HttpStatus } from "@nestjs/common";
import { UserNotFoundError, WrongPasswordError } from "src/BusinessErrors";

describe("LoginController", () => {
    let loginController: LoginController;
    let jwtService: { signAsync: jest.Mock };
    let loginUseCaseMock: { login: jest.Mock };
    const userMock = new User("Gianni", "Testing1234");
    const userDTOMock = new UserDTO("Gianni", "Testing1234");
    const jwtMock = { accessToken: "mockToken" };

    const createTestingModule = async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LoginController],
            providers: [
                { provide: LOGIN_USE_CASE, useValue: loginUseCaseMock },
                { provide: JwtService, useValue: jwtService }
            ]
        }).compile();
        loginController = module.get<LoginController>(LoginController);
    };

    beforeEach(async () => {
        loginUseCaseMock = { login: jest.fn() };
        jwtService = { signAsync: jest.fn() };
        await createTestingModule();
    });

    describe("login", () => {
        it("should login the user", async () => {
            loginUseCaseMock.login.mockResolvedValue(userMock);
            jwtService.signAsync.mockResolvedValue(jwtMock.accessToken);
            expect(await loginController.login(userDTOMock)).toEqual(jwtMock);
        });

        it("should throw HttpException because the database throws an exception", async () => {
            loginUseCaseMock.login.mockImplementation(() => {
                throw new MongooseError("");
            });
            const result = loginController.login(userDTOMock);
            expect(result).rejects.toThrow(HttpException);
            expect(result).rejects.toHaveProperty("status", HttpStatus.INTERNAL_SERVER_ERROR);
        });

        it("should throw HttpException because the username was not found in the database", async () => {
            loginUseCaseMock.login.mockImplementation(() => {
                throw new UserNotFoundError();
            });
            const result = loginController.login(userDTOMock);
            expect(result).rejects.toThrow(HttpException);
            expect(result).rejects.toHaveProperty("status", HttpStatus.BAD_REQUEST);
        });

        it("should throw HttpException because password doesn't match", async () => {
            loginUseCaseMock.login.mockImplementation(() => {
                throw new WrongPasswordError();
            });
            const result = loginController.login(userDTOMock);
            expect(result).rejects.toThrow(HttpException);
            expect(result).rejects.toHaveProperty("status", HttpStatus.BAD_REQUEST);
        });
    });
});
