import "reflect-metadata";
import {
  Param,
  Body,
  Get,
  Post,
  Put,
  Delete,
  JsonController,
  Params,
  NotFoundError,
  BadRequestError,
} from "routing-controllers";
import { ProductDTO } from "../dto/Product";
import { MESSAGE_ERROR } from "../const/message-error.const";
import { ProductInterface } from "../interfaces/product.interface";

@JsonController("/products")
export class ProductController {
  products: ProductInterface[] = [];

  @Get("")
  getAll() {
    return {
      data: [...this.products],
    };
  }

  @Get("/verification/:id")
  verifyIdentifier(@Param("id") id: number | string) {
    return this.products.some((product) => product.id === id);
  }

  @Get("/:id")
  getOne(@Param("id") id: number | string) {
    const index = this.findIndex(id);

    if (index === -1) {
      throw new NotFoundError(MESSAGE_ERROR.NotFound);
    }
    return this.products.find((product) => product.id === id);
  }

  @Post("")
  createItem(@Body({ validate: true }) productItem: ProductDTO) {

    const index = this.findIndex(productItem.id);

    if (index !== -1) {
      throw new BadRequestError(MESSAGE_ERROR.DuplicateIdentifier);
    }

    this.products.push(productItem);
    return {
      message: "Product added successfully",
      data: productItem,
    };
  }

  @Put("/:id")
  put(@Param("id") id: number | string, @Body() productItem: ProductInterface) {
    const index = this.findIndex(id);

    if (index === -1) {
      throw new NotFoundError(MESSAGE_ERROR.NotFound);
    }

    this.products[index] = {
      ...this.products[index],
      ...productItem,
    };
    return {
      message: "Product updated successfully",
      data: productItem,
    };
  }

  @Delete("/:id")
  remove(@Param("id") id: number | string) {
    const index = this.findIndex(id);

    if (index === -1) {
      throw new NotFoundError(MESSAGE_ERROR.NotFound);
    }

    this.products = [...this.products.filter((product) => product.id !== id)];
    return {
      message: "Product removed successfully",
    };
  }

  private findIndex(id: number | string) {
    return this.products.findIndex((product) => product.id === id);
  }
  constructor() {
    this.products = [
      {
        id: "trj-crd",
        name: "Tarjeta de Crédito Clásica",
        description: "Tarjeta de consumo bajo la modalidad de crédito",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2025-03-01"),
        date_revision: new Date("2026-03-01"),
      },
      {
        id: "cdt-001",
        name: "CDT a 360 días",
        description: "Certificado de depósito a término fijo con excelente tasa",        
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2025-01-15"),
        date_revision: new Date("2026-01-15"),
      },
      {
        id: "cred-hip",
        name: "Crédito Hipotecario Vivienda",
        description: "Financiación hasta el 80% del valor del inmueble",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2024-11-20"),
        date_revision: new Date("2025-11-20"),
      },
            {
        id: "trj-gld",
        name: "Tarjeta de Crédito Gold",
        description: "Línea de crédito ampliada y beneficios premium",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2025-02-10"),
        date_revision: new Date("2026-02-10"),
      },
      {
        id: "trj-plt",
        name: "Tarjeta Platinum",
        description: "Tarjeta de crédito con beneficios exclusivos",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2025-04-01"),
        date_revision: new Date("2026-04-01"),
      },
      {
        id: "trj-blk",
        name: "Tarjeta Black",
        description: "Tarjeta de gama alta con servicios premium",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2024-12-15"),
        date_revision: new Date("2025-12-15"),
      },
      {
        id: "cdn-001",
        name: "Cuenta de Nómina",
        description: "Cuenta diseñada para la recepción de salarios",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2024-12-01"),
        date_revision: new Date("2025-12-01"),
      },
      {
        id: "cta-ah-01",
        name: "Cuenta de Ahorros Tradicional",
        description: "Cuenta con intereses y manejo básico",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2025-01-20"),
        date_revision: new Date("2026-01-20"),
      },
      {
        id: "cta-ah-02",
        name: "Cuenta de Ahorros Premium",
        description: "Mejores tasas para saldos altos",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2024-09-10"),
        date_revision: new Date("2025-09-10"),
      },
      {
        id: "inv-fnd-01",
        name: "Fondo de Inversión Conservador",
        description: "Riesgo bajo y rentabilidad estable",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2024-10-05"),
        date_revision: new Date("2025-10-05"),
      },
      {
        id: "inv-fnd-02",
        name: "Fondo de Inversión Moderado",
        description: "Equilibrio entre riesgo y retorno",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2025-03-15"),
        date_revision: new Date("2026-03-15"),
      },
      {
        id: "inv-fnd-03",
        name: "Fondo de Inversión Agresivo",
        description: "Alta rentabilidad con riesgo elevado",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2025-05-10"),
        date_revision: new Date("2026-05-10"),
      },
      {
        id: "cdt-002",
        name: "CDT a 180 días",
        description: "CDT de corto plazo con buena tasa",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2025-02-01"),
        date_revision: new Date("2026-02-01"),
      },
      {
        id: "cdt-003",
        name: "CDT a 90 días",
        description: "Inversión rápida con rentabilidad fija",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2024-10-25"),
        date_revision: new Date("2025-10-25"),
      },
      {
        id: "seg-vida",
        name: "Seguro de Vida",
        description: "Cobertura completa para riesgos personales",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2025-03-30"),
        date_revision: new Date("2026-03-30"),
      },
      {
        id: "seg-hogar",
        name: "Seguro de Hogar",
        description: "Protección completa para tu vivienda",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2024-08-20"),
        date_revision: new Date("2025-08-20"),
      },
      {
        id: "seg-auto",
        name: "Seguro de Auto",
        description: "Cobertura total ante accidentes y robos",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2025-05-05"),
        date_revision: new Date("2026-05-05"),
      },
      {
        id: "crd-prs",
        name: "Crédito Personal",
        description: "Crédito rápido con aprobación express",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2024-11-01"),
        date_revision: new Date("2025-11-01"),
      },
      {
        id: "crd-edu",
        name: "Crédito Educativo",
        description: "Financiación para estudios superiores",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2025-06-01"),
        date_revision: new Date("2026-06-01"),
      },
      {
        id: "crd-auto",
        name: "Crédito Vehicular",
        description: "Crédito para adquisición de vehículo nuevo",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2024-09-18"),
        date_revision: new Date("2025-09-18"),
      },
      {
        id: "billetera-01",
        name: "Billetera Digital Standard",
        description: "Pagos rápidos desde el celular",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2025-01-10"),
        date_revision: new Date("2026-01-10"),
      },
      {
        id: "billetera-02",
        name: "Billetera Digital Premium",
        description: "Incluye cashback y recompensas",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2024-12-22"),
        date_revision: new Date("2025-12-22"),
      },
      {
        id: "apl-bnk",
        name: "App Bancaria Plus",
        description: "Gestión completa de productos digitales",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2025-03-03"),
        date_revision: new Date("2026-03-03"),
      },
      {
        id: "cta-corr-01",
        name: "Cuenta Corriente Empresarial",
        description: "Cuenta para manejo de flujos de negocio",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2024-10-12"),
        date_revision: new Date("2025-10-12"),
      },
      {
        id: "cta-corr-02",
        name: "Cuenta Corriente Premium",
        description: "Beneficios preferenciales para clientes VIP",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2025-02-22"),
        date_revision: new Date("2026-02-22"),
      },
      {
        id: "pln-pen",
        name: "Plan de Pensiones",
        description: "Ahorro programado para retiro",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2025-04-10"),
        date_revision: new Date("2026-04-10"),
      },
      {
        id: "pln-inv",
        name: "Plan de Inversión Automática",
        description: "Aportes recurrentes a fondos de inversión",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2024-07-14"),
        date_revision: new Date("2025-07-14"),
      },
      {
        id: "pag-movil",
        name: "Pago Móvil",
        description: "Pagos de persona a persona al instante",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2025-03-28"),
        date_revision: new Date("2026-03-28"),
      },
      {
        id: "cred-emp",
        name: "Crédito Empresarial",
        description: "Línea de financiación para empresas",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2024-11-30"),
        date_revision: new Date("2025-11-30"),
      },
      {
        id: "leasing-01",
        name: "Leasing Vehicular",
        description: "Arrendamiento financiero de vehículos",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2025-05-20"),
        date_revision: new Date("2026-05-20"),
      },
      {
        id: "leasing-02",
        name: "Leasing Maquinaria",
        description: "Arrendamiento de maquinaria pesada",
        logo: "https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg",
        date_release: new Date("2024-10-08"),
        date_revision: new Date("2025-10-08"),
      }
    ];
  }
}
