import gql from 'graphql-tag';
import { PAGINATION_QUERY } from '../components/Pagination';

export default function paginationField() {
  return {
    keyArgs: false, //* tells apollo we will take care of everything
    read(existing = [], { args, cache }) {
      //* First thing it does is asks the read function for the items
      //* Either return the items because they are in cache or return false and send a network request

      const { skip, first } = args;

      //* read the number of items on the page from the cache
      const data = cache.readQuery({ query: PAGINATION_QUERY });
      const count = data?._allProductsMeta?.count;
      const page = skip / first + 1;
      const pages = Math.ceil(count / first);

      //* Check if we have existing items
      const items = existing.slice(skip, skip + first).filter((x) => x);
      //* if there are items
      //* AND there aren't enough items to satisfy how many are requested
      //* AND we're on the last page, just send it
      if (items.length && items.length !== first && page === pages) {
        return items;
      }

      if (items.length !== first) {
        //* We don't have any items
        return false;
      }

      //* If there are items, return from cache
      if (items.length) {
        return items;
      }

      return false; //* fallback to network
    },
    merge(existing, incoming, { args }) {
      //* This runs when the apollo client comes back from the network with data
      console.log(`Merging items from the network ${incoming.length}`);
      const { skip, first } = args;
      const merged = existing ? existing.slice(0) : [];
      for (let i = skip; i < skip + incoming.length; ++i) {
        merged[i] = incoming[i - skip];
      }

      //* finally return merged items from the cache
      return merged;
    },
  };
}
