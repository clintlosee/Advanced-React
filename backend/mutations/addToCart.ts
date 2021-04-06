import { KeystoneContext } from '@keystone-next/types';
import { Session } from '../types'
import { CartItemCreateInput } from '../.keystone/schema-types'

export default async function addToCart(
  root: any,
  { productId }: { productId: string },
  context: KeystoneContext
): Promise<CartItemCreateInput> {
  console.log('adding to cart');
  //* Query the current user to see if they are signed in
  const sesh = context.session as Session;
  if (!sesh.itemId) {
    throw new Error('You must be logged in to do this!')
  }

  //* Query the current user's cart
  const allCartItems = await context.lists.CartItem.findMany({
    where: { user: { id: sesh.itemId }, product: { id: productId } },
    resolveFields: 'id,quantity',
  });

  //* See if the current item is in their cart
  //* - if it is, increment by 1
  const [existingCartItem] = allCartItems;
  if (existingCartItem) {
    console.log(`Already in cart (${existingCartItem.quantity}), increment by 1`);

    return await context.lists.CartItem.updateOne({
      id: existingCartItem.id,
      data: { quantity: existingCartItem.quantity + 1 }
    })
  }
  //* - if it isn't, create a new cart item
  return await context.lists.CartItem.createOne({
    data: {
      product: { connect: { id: productId } },
      user: { connect: { id: sesh.itemId } },
    }
  })
}
