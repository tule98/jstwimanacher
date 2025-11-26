"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";
import { SuggestionOptions } from "@tiptap/suggestion";
import tippy, { Instance as TippyInstance } from "tippy.js";
import "tippy.js/dist/tippy.css";
import "./tiptap-styles.css";
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useMemo,
} from "react";
import type { Habit } from "@/services/api/habits";

interface DateMention {
  type: "date";
  id: string;
  label: string;
  value: string; // YYYY-MM-DD format
}

interface HabitMention {
  type: "habit";
  id: string;
  label: string;
}

type MentionItem = DateMention | HabitMention;

export interface ParsedJournalData {
  habitMentions: Array<{ id: string; name: string }>;
  dateMentions: Array<{ label: string; date: string }>;
  content: string;
}

interface MentionListProps {
  items: MentionItem[];
  command: (item: { id: string; label: string }) => void;
}

interface MentionListHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const MentionList = forwardRef<MentionListHandle, MentionListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = props.items[index];
      if (item) {
        props.command({ id: item.id, label: item.label });
      }
    };

    const upHandler = () => {
      setSelectedIndex(
        (selectedIndex + props.items.length - 1) % props.items.length
      );
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          upHandler();
          return true;
        }

        if (event.key === "ArrowDown") {
          downHandler();
          return true;
        }

        if (event.key === "Enter") {
          enterHandler();
          return true;
        }

        return false;
      },
    }));

    return (
      <Paper
        elevation={3}
        sx={{
          maxHeight: 300,
          overflow: "auto",
          minWidth: 200,
        }}
      >
        <List dense disablePadding>
          {props.items.length ? (
            props.items.map((item, index) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={index === selectedIndex}
                  onClick={() => selectItem(index)}
                  sx={{
                    bgcolor:
                      index === selectedIndex
                        ? "action.selected"
                        : "transparent",
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    secondary={
                      item.type === "date"
                        ? (item as DateMention).value
                        : undefined
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No habits found" />
            </ListItem>
          )}
        </List>
      </Paper>
    );
  }
);

MentionList.displayName = "MentionList";

interface HabitLogInputWithTagInsertionProps {
  habits: Habit[];
  value?: string;
  onChange?: (html: string) => void;
  onPreviewChange?: (data: ParsedJournalData) => void;
  placeholder?: string;
  showPreview?: boolean;
}

// Helper function to generate date mentions
const getDateSuggestions = (): DateMention[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const formatDate = (date: Date) => date.toISOString().slice(0, 10);

  return [
    { type: "date", id: "today", label: "today", value: formatDate(today) },
    {
      type: "date",
      id: "tomorrow",
      label: "tomorrow",
      value: formatDate(tomorrow),
    },
    {
      type: "date",
      id: "yesterday",
      label: "yesterday",
      value: formatDate(yesterday),
    },
  ];
};

// Parser function to extract all mentions from HTML content
const parseJournalContent = (
  html: string,
  habits: Habit[]
): ParsedJournalData => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const mentions = doc.querySelectorAll('[data-type="mention"]');
  const dateDocMentions = doc.querySelectorAll('[data-type="dateMention"]');
  console.log("🚀 ~ parseJournalContent ~ dateDocMentions:", dateDocMentions);

  const habitMentions: Array<{ id: string; name: string }> = [];
  const dateMentions: Array<{ label: string; date: string }> = [];
  const dateSuggestions = getDateSuggestions();

  [...mentions, ...dateDocMentions].forEach((mention) => {
    const id = mention.getAttribute("data-id") || "";

    // Check if it's a date mention
    const dateMention = dateSuggestions.find((d) => d.id === id);
    if (dateMention) {
      dateMentions.push({ label: dateMention.label, date: dateMention.value });
    } else {
      // It's a habit mention
      const habit = habits.find((h) => h.id === id);
      if (habit) {
        habitMentions.push({ id: habit.id, name: habit.name });
      }
    }
  });

  return {
    habitMentions,
    dateMentions,
    content: html,
  };
};

export default function HabitLogInputWithTagInsertion({
  habits,
  value = "",
  onChange,
  onPreviewChange,
  placeholder = "Type @ for habits, : for dates...",
  showPreview = true,
}: HabitLogInputWithTagInsertionProps) {
  const dateSuggestions = useMemo(() => getDateSuggestions(), []);

  const parsedData = useMemo(() => {
    return parseJournalContent(value, habits);
  }, [value, habits]);

  useEffect(() => {
    if (onPreviewChange) {
      onPreviewChange(parsedData);
    }
  }, [parsedData, onPreviewChange]);

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        // Habit mentions with @
        Mention.configure({
          HTMLAttributes: {
            class: "mention mention-habit",
          },
          suggestion: {
            char: "@",
            items: ({ query }: { query: string }) => {
              const habitItems: MentionItem[] = habits
                .filter((habit) =>
                  habit.name.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 5)
                .map((h) => ({
                  type: "habit" as const,
                  id: h.id,
                  label: h.name,
                }));
              return habitItems;
            },
            render: () => {
              let component: ReactRenderer<MentionListHandle, MentionListProps>;
              let popup: TippyInstance[];

              return {
                onStart: (props) => {
                  component = new ReactRenderer(MentionList, {
                    props: {
                      ...props,
                      items: props.items as MentionItem[],
                    },
                    editor: props.editor,
                  });

                  if (!props.clientRect) {
                    return;
                  }

                  popup = tippy("body", {
                    getReferenceClientRect: props.clientRect as () => DOMRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: "manual",
                    placement: "bottom-start",
                  });
                },

                onUpdate(props) {
                  component.updateProps({
                    ...props,
                    items: props.items as MentionItem[],
                  });

                  if (!props.clientRect) {
                    return;
                  }

                  popup[0].setProps({
                    getReferenceClientRect: props.clientRect as () => DOMRect,
                  });
                },

                onKeyDown(props) {
                  if (props.event.key === "Escape") {
                    popup[0].hide();

                    return true;
                  }

                  return component.ref?.onKeyDown(props) ?? false;
                },

                onExit() {
                  popup[0].destroy();
                  component.destroy();
                },
              };
            },
          } as Partial<SuggestionOptions>,
        }),
        // Date mentions with :
        Mention.extend({
          name: "dateMention",
        }).configure({
          HTMLAttributes: {
            class: "mention mention-date",
          },
          suggestion: {
            char: ":",
            items: ({ query }: { query: string }) => {
              return dateSuggestions.filter((date) =>
                date.label.toLowerCase().includes(query.toLowerCase())
              ) as MentionItem[];
            },
            render: () => {
              let component: ReactRenderer<MentionListHandle, MentionListProps>;
              let popup: TippyInstance[];

              return {
                onStart: (props) => {
                  component = new ReactRenderer(MentionList, {
                    props: {
                      ...props,
                      items: props.items as MentionItem[],
                    },
                    editor: props.editor,
                  });

                  if (!props.clientRect) {
                    return;
                  }

                  popup = tippy("body", {
                    getReferenceClientRect: props.clientRect as () => DOMRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: "manual",
                    placement: "bottom-start",
                  });
                },

                onUpdate(props) {
                  component.updateProps({
                    ...props,
                    items: props.items as MentionItem[],
                  });

                  if (!props.clientRect) {
                    return;
                  }

                  popup[0].setProps({
                    getReferenceClientRect: props.clientRect as () => DOMRect,
                  });
                },

                onKeyDown(props) {
                  if (props.event.key === "Escape") {
                    popup[0].hide();

                    return true;
                  }

                  return component.ref?.onKeyDown(props) ?? false;
                },

                onExit() {
                  popup[0].destroy();
                  component.destroy();
                },
              };
            },
          } as Partial<SuggestionOptions>,
        }),
      ],
      content: value,
      onUpdate: ({ editor }) => {
        onChange?.(editor.getHTML());
      },
      editorProps: {
        attributes: {
          class: "tiptap-editor",
        },
      },
      immediatelyRender: false,
    },
    [dateSuggestions]
  );

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <Box>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          p: 2,
          minHeight: 120,
          "& .tiptap-editor": {
            outline: "none",
            minHeight: 80,
            "& .mention-habit": {
              backgroundColor: "primary.light",
              color: "primary.contrastText",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: 500,
            },
            "& .mention-date": {
              backgroundColor: "success.light",
              color: "success.contrastText",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: 500,
            },
            "& p.is-editor-empty:first-child::before": {
              content: `"${placeholder}"`,
              color: "text.disabled",
              pointerEvents: "none",
              height: 0,
              float: "left",
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {showPreview &&
        (parsedData.habitMentions.length > 0 ||
          parsedData.dateMentions.length > 0) && (
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "grey.50",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Typography
              variant="caption"
              fontWeight="bold"
              gutterBottom
              display="block"
            >
              Preview - Data to be saved:
            </Typography>

            {parsedData.habitMentions.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  gutterBottom
                  display="block"
                >
                  Habit Mentions ({parsedData.habitMentions.length}):
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {parsedData.habitMentions.map((mention, idx) => (
                    <Chip
                      key={`${mention.id}-${idx}`}
                      label={mention.name}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {parsedData.dateMentions.length > 0 && (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  gutterBottom
                  display="block"
                >
                  Date Mentions ({parsedData.dateMentions.length}):
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {parsedData.dateMentions.map((mention, idx) => (
                    <Chip
                      key={`${mention.date}-${idx}`}
                      label={`${mention.label} (${mention.date})`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        )}
    </Box>
  );
}
