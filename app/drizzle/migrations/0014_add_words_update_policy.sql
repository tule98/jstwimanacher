-- Add UPDATE policy for words table
-- Allow authenticated users to update word enrichment data (definition, phonetic, example_sentence, part_of_speech)

DROP POLICY IF EXISTS words_update_policy ON words;
CREATE POLICY words_update_policy ON words
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
