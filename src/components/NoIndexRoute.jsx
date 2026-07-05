import { Outlet } from 'react-router-dom';
import NoIndex from '@/components/NoIndex';

/**
 * Layout route that injects <NoIndex /> for its nested routes without adding an
 * auth gate. Use for pages that stay publicly routable (their own membership
 * gate handles access, or they're transactional/internal) but must never be
 * indexed by search engines.
 */
export default function NoIndexRoute() {
  return (
    <>
      <NoIndex />
      <Outlet />
    </>
  );
}