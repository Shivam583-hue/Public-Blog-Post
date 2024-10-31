"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const categories = [
            "Hardware",
            "Health",
            "Education",
            "Personal Progress",
            "Software",
            "Food",
            "Travel",
            "Photography",
            "Business"
        ];
        for (const category of categories) {
            // Check if the category already exists
            const existingCategory = yield prisma.category.findUnique({
                where: { name: category }
            });
            // If it doesn't exist, create it
            if (!existingCategory) {
                yield prisma.category.create({
                    data: {
                        name: category
                    }
                });
            }
        }
        console.log("Predefined categories added!");
    });
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
