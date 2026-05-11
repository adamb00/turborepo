import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  TerminalSquareIcon,
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  FrameIcon,
  PieChartIcon,
  MapIcon,
} from "lucide-react"
export const data = {
  navMain: [
    {
      title: "Menu 1",
      url: "#",
      icon: <TerminalSquareIcon />,
      isActive: true,
      items: [
        {
          title: "Submenu 1",
          url: "#",
        },
        {
          title: "Submenu 2",
          url: "#",
        },
        {
          title: "Submenu 3",
          url: "#",
        },
      ],
    },
    {
      title: "Menu 2",
      url: "#",
      icon: <BotIcon />,
      items: [
        {
          title: "Submenu 1",
          url: "#",
        },
        {
          title: "Submenu 2",
          url: "#",
        },
        {
          title: "Submenu 3",
          url: "#",
        },
      ],
    },
    {
      title: "Menu 3",
      url: "#",
      icon: <BookOpenIcon />,
      items: [
        {
          title: "Submenu 1",
          url: "#",
        },
        {
          title: "Submenu 2",
          url: "#",
        },
        {
          title: "Submenu 3",
          url: "#",
        },
        {
          title: "Submenu 4",
          url: "#",
        },
      ],
    },
    {
      title: "Menu 4",
      url: "#",
      icon: <Settings2Icon />,
      items: [
        {
          title: "Submenu 1",
          url: "#",
        },
        {
          title: "Submenu 2",
          url: "#",
        },
        {
          title: "Submenu 3",
          url: "#",
        },
        {
          title: "Submenu 4",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Menu 5",
      url: "#",
      icon: <FrameIcon />,
    },
    {
      name: "Menu 6",
      url: "#",
      icon: <PieChartIcon />,
    },
    {
      name: "Menu 7",
      url: "#",
      icon: <MapIcon />,
    },
  ],
}
