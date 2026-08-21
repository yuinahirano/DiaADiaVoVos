// Isso representa o que fica DENTRO do token JWT (o que foi assinado no login).
// Nessa abordagem, o token só guarda o id do usuário — o papel é sempre resolvido
// consultando o banco, então o token não precisa saber se é idoso ou cuidador.
export interface JwtPayload {
  id: string;
  email: string;
}