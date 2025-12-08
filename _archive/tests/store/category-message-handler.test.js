/**
 * Pruebas para CategoryMessageHandler
 * Verifica el sistema de mensajes informativos para categorías vacías
 */

// Mock del DOM para las pruebas
const { JSDOM } = require("jsdom");
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
global.document = dom.window.document;
global.window = dom.window;

// Importar el módulo después de configurar el DOM
const categoryMessageHandler =
  require("../../js/modules/store/CategoryMessageHandler.js").default;

describe("CategoryMessageHandler", () => {
  beforeEach(() => {
    // Limpiar cualquier estado previo
    document.body.innerHTML = "";
  });

  describe("generateInformativeMessage", () => {
    test('debe generar mensaje para categoría "avatares"', () => {
      const message =
        categoryMessageHandler.generateInformativeMessage("avatares");

      expect(message.category).toBe("avatares");
      expect(message.title).toContain("Avatares");
      expect(message.icon).toBe("fas fa-user-circle");
      expect(message.description).toContain("Personaliza tu apariencia");
    });

    test('debe generar mensaje para categoría "monedas"', () => {
      const message =
        categoryMessageHandler.generateInformativeMessage("monedas");

      expect(message.category).toBe("monedas");
      expect(message.title).toContain("Monedas");
      expect(message.icon).toBe("fas fa-coins");
      expect(message.description).toContain("Compra monedas");
    });

    test('debe generar mensaje para categoría "powerups" en desarrollo', () => {
      const message =
        categoryMessageHandler.generateInformativeMessage("powerups");

      expect(message.category).toBe("powerups");
      expect(message.type).toBe("development");
      expect(message.title).toContain("Power-ups en Desarrollo");
      expect(message.message).toContain("están actualmente en desarrollo");
    });

    test('debe generar mensaje para categoría "premium" en planificación', () => {
      const message =
        categoryMessageHandler.generateInformativeMessage("premium");

      expect(message.category).toBe("premium");
      expect(message.type).toBe("planning");
      expect(message.title).toContain("Premium Próximamente");
      expect(message.message).toContain("hoja de ruta");
    });

    test("debe generar mensaje genérico para categoría desconocida", () => {
      const message =
        categoryMessageHandler.generateInformativeMessage("unknown");

      expect(message.category).toBe("unknown");
      expect(message.type).toBe("temporaryEmpty");
      expect(message.title).toContain("Unknown");
      expect(message.icon).toBe("fas fa-box-open");
    });
  });

  describe("determineMessageType", () => {
    test('debe retornar "offline" cuando el contexto indica sin conexión', () => {
      const messageType = categoryMessageHandler.determineMessageType(
        "avatares",
        { isOffline: true }
      );
      expect(messageType).toBe("offline");
    });

    test('debe retornar "loadingError" cuando hay error de carga', () => {
      const messageType = categoryMessageHandler.determineMessageType(
        "avatares",
        { hasLoadingError: true }
      );
      expect(messageType).toBe("loadingError");
    });

    test('debe retornar "development" para categorías en desarrollo', () => {
      const messageType =
        categoryMessageHandler.determineMessageType("powerups");
      expect(messageType).toBe("development");
    });

    test('debe retornar "planning" para categorías en planificación', () => {
      const messageType =
        categoryMessageHandler.determineMessageType("premium");
      expect(messageType).toBe("planning");
    });

    test('debe retornar "temporaryEmpty" para categorías activas con contenido esperado', () => {
      const messageType =
        categoryMessageHandler.determineMessageType("avatares");
      expect(messageType).toBe("temporaryEmpty");
    });
  });

  describe("generateActions", () => {
    test("debe generar acción de reintentar", () => {
      const actions = categoryMessageHandler.generateActions(
        ["retry"],
        "avatares"
      );

      expect(actions).toHaveLength(1);
      expect(actions[0].label).toBe("Reintentar");
      expect(actions[0].icon).toBe("fas fa-redo");
      expect(actions[0].action).toContain("loadCategoryProducts");
    });

    test("debe generar múltiples acciones", () => {
      const actions = categoryMessageHandler.generateActions(
        ["retry", "support"],
        "avatares"
      );

      expect(actions).toHaveLength(2);
      expect(actions[0].label).toBe("Reintentar");
      expect(actions[1].label).toBe("Soporte");
    });

    test("debe generar acción de notificación", () => {
      const actions = categoryMessageHandler.generateActions(
        ["notify"],
        "powerups"
      );

      expect(actions).toHaveLength(1);
      expect(actions[0].label).toBe("Notificarme");
      expect(actions[0].icon).toBe("fas fa-bell");
    });
  });

  describe("renderInformativeMessage", () => {
    test("debe crear elemento HTML con estructura correcta", () => {
      const messageData = {
        title: "Test Title",
        message: "Test Message",
        icon: "fas fa-test",
        description: "Test Description",
        actions: [
          {
            label: "Test Action",
            icon: "fas fa-action",
            action: 'alert("test")',
          },
        ],
      };

      const container = document.createElement("div");
      const element = categoryMessageHandler.renderInformativeMessage(
        messageData,
        container
      );

      expect(element.classList.contains("informative-empty-state")).toBe(true);
      expect(element.querySelector(".empty-state-header h3").textContent).toBe(
        "Test Title"
      );
      expect(element.querySelector(".empty-state-content p").textContent).toBe(
        "Test Message"
      );
      expect(
        element.querySelector(".empty-state-content small").textContent
      ).toBe("Test Description");
      expect(element.querySelector(".btn-action").textContent.trim()).toContain(
        "Test Action"
      );
    });

    test("debe crear elemento sin acciones", () => {
      const messageData = {
        title: "Test Title",
        message: "Test Message",
        icon: "fas fa-test",
        description: "Test Description",
        actions: [],
      };

      const container = document.createElement("div");
      const element = categoryMessageHandler.renderInformativeMessage(
        messageData,
        container
      );

      expect(element.querySelector(".empty-state-actions")).toBeNull();
    });

    test("debe agregar elemento al contenedor", () => {
      const messageData = {
        title: "Test Title",
        message: "Test Message",
        icon: "fas fa-test",
        description: "Test Description",
        actions: [],
      };

      const container = document.createElement("div");
      categoryMessageHandler.renderInformativeMessage(messageData, container);

      expect(container.children.length).toBe(1);
      expect(
        container.firstChild.classList.contains("informative-empty-state")
      ).toBe(true);
    });
  });

  describe("interpolateMessage", () => {
    test("debe interpolar variables correctamente", () => {
      const metadata = { name: "Avatares" };
      const message = "Los {categoryName} están en {CategoryName}";

      const result = categoryMessageHandler.interpolateMessage(
        message,
        metadata
      );

      expect(result).toBe("Los avatares están en Avatares");
    });
  });

  describe("getDefaultMetadata", () => {
    test("debe generar metadatos por defecto", () => {
      const metadata = categoryMessageHandler.getDefaultMetadata("test");

      expect(metadata.name).toBe("Test");
      expect(metadata.icon).toBe("fas fa-box-open");
      expect(metadata.expectedContent).toBe(true);
      expect(metadata.developmentStatus).toBe("unknown");
      expect(metadata.description).toBe("Contenido de test");
    });
  });
});
