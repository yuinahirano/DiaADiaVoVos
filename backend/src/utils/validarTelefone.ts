export class TelefoneUtils {
  static limpar(telefone: string): string {
    return telefone.replace(/\D/g, "");
  }

  static validar(telefone: string): boolean {
    const telefoneLimpo = this.limpar(telefone);

    // DDD + celular = 11 dígitos
    if (telefoneLimpo.length !== 11) {
      return false;
    }

  const dddsValidos = [
  "11","12","13","14","15","16","17","18","19",
  "21","22","24","27","28",
  "31","32","33","34","35","37","38","39",
  "41","42","43","44","45","46","47","48","49",
  "51","53","54","55",
  "61","62","63","64","65","66","67","68","69",
  "71","73","74","75","77","79",
  "81","82","83","84","85","86","87","88","89",
  "91","92","93","94","95","96","97","98","99"
  ];

    const ddd = telefoneLimpo.slice(0, 2);

    // valida DDD
    if (!dddsValidos.includes(ddd)) {
      return false;
    }

    // celular precisa começar com 9
    const numero = telefoneLimpo.slice(2);

    return numero.startsWith("9");
  }
}