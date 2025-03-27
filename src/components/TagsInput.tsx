import React, { useState } from 'react';
import { TextField, Button, Box, Chip, Stack } from '@mui/material';

interface TagsInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
}

const TagsInput: React.FC<TagsInputProps> = ({ tags, onChange }) => {
    const [inputTag, setInputTag] = useState<string>('');

    const handleAddTag = () => {
        if (inputTag.trim() !== '' && !tags.includes(inputTag.trim())) {
            onChange([...tags, inputTag.trim()]);
            setInputTag('');
        }
    };

    const handleDeleteTag = (tagToDelete: string) => {
        onChange(tags.filter(tag => tag !== tagToDelete));
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', mb: 1 }}>
                <TextField
                    fullWidth
                    size="small"
                    label="Add Tag"
                    value={inputTag}
                    onChange={(e) => setInputTag(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                        }
                    }}
                />
                <Button
                    variant="outlined"
                    onClick={handleAddTag}
                    disabled={inputTag.trim() === ''}
                    sx={{ ml: 1 }}
                >
                    Add
                </Button>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {tags.map((tag) => (
                    <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleDeleteTag(tag)}
                        size="small"
                    />
                ))}
            </Stack>
        </Box>
    );
};

export default TagsInput; 