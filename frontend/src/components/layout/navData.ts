export interface NavItem {
  label: string;
  path: string;
}

export const navItems: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Music', path: '/music' },
  { label: 'Artists', path: '/artists' },
  { label: 'Services', path: '/services' },
  { label: 'Events', path: '/events' },
  { label: 'Videos', path: '/videos' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];
