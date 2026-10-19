// Edit this file to change cats, names and diary text.
// To use your own PNG drawing for a cat, add  src: '/cats/biscuit.png'  to that cat (put the file in public/cats/).
export const TOTAL_PAGES = 10 // page 1 = intro, pages 2-9 = cats, page 10 = ending (keep this an even number)

export const CATS = [
  { name: 'Biscuit', title: 'Friend No. 1', day: 'Day 2', fur: '#f0a25a', belly: '#ffe9cc', mark: '#c97a35', pattern: 'tabby', ear: 'point', eyes: 'round', mouth: 'smile', body: 'chubby', tail: 'curl', acc: [], doodles: ['toast', 'heart', 'star'], seed: 2,
    text: 'Today a big orange cat found me hiding in the blue flowers. She said "mrrp?" and I said "mrrp!" and now we are best friends. She smells like warm toast, so I named her Biscuit. Her tummy is the softest hill in the whole galaxy.' },
  { name: 'Noodle', title: 'Friend No. 2', day: 'Day 3', fur: '#b9b3ae', belly: '#efe9e2', mark: '#8d8782', pattern: 'none', ear: 'tall', eyes: 'sleepy', mouth: 'smile', body: 'tall', tail: 'up', acc: ['nightcap'], doodles: ['zzz', 'moon', 'cloud'], seed: 4,
    text: 'Noodle is very, very long. I tried to measure her with my hands but she kept going and going. She naps on the warm moon rocks all day. When I tickled her ear she said "prrr" and did not even open her eyes. I think she dreams about fish.' },
  { name: 'Mister Grumble', title: 'Friend No. 3', day: 'Day 4', fur: '#5d4d4a', belly: '#f1e6dc', paws: '#f1e6dc', mark: '#443735', pattern: 'none', ear: 'point', eyes: 'grumpy', mouth: 'frown', body: 'chubby', tail: 'short', acc: ['flowerEar'], doodles: ['flower', 'paw', 'sparkle'], seed: 7,
    text: 'Mister Grumble makes a grumpy face at everybody. I made a grumpy face back and he looked so surprised! Then I giggled and he did a teeny purr. I gave him a flower and he said he did not like it. But he kept it on his ear all day.' },
  { name: 'Queen Marshmallow', title: 'Friend No. 4', day: 'Day 5', fur: '#fff4e6', belly: '#ffffff', mark: '#f0dcc3', pattern: 'none', ear: 'round', eyes: 'sparkle', mouth: 'smile', body: 'fluffy', tail: 'fluffy', fluff: true, acc: ['crown'], doodles: ['star', 'sparkle', 'heart'], seed: 9,
    text: 'This is the Queen! She is so fluffy, like a cloud that learned to walk. Her crown is shiny and a little too big. Everybody bowed, so I bowed too and fell over. She laughed and said I can stay as long as I want. Her palace smells like warm milk.' },
  { name: 'Sprinkles', title: 'Friend No. 5', day: 'Day 6', fur: '#fff1de', belly: '#ffffff', mark: '#5b4a45', pattern: 'spots', ear: 'point', eyes: 'sparkle', mouth: 'open', body: 'small', tail: 'up', acc: ['bell'], doodles: ['yarn', 'paw', 'sparkle'], seed: 3,
    text: 'Sprinkles has colour spots like candy. She runs in circles and then forgets why, and then she runs again! I tried to catch her and she caught me instead. We fell in the star dust and both sneezed. Best game ever. Again tomorrow, okay?' },
  { name: 'Captain Sardine', title: 'Friend No. 6', day: 'Day 8', fur: '#9db4c8', belly: '#e8f0f5', mark: '#6c88a3', pattern: 'tabby', ear: 'point', eyes: 'round', mouth: 'smile', body: 'chubby', tail: 'curl', acc: ['sailor'], doodles: ['fish', 'cloud', 'star'], seed: 5,
    text: 'Captain Sardine says he sails the Great Milk Sea, but I have never seen a boat. He keeps a snack fish inside his hat for emergencies. He let me wear the hat for one whole second. I said "ahoy!" and every cat clapped. I felt so brave.' },
  { name: 'Twinkle', title: 'Friend No. 7', day: 'Day 9', fur: '#8a6a55', belly: '#d9bda4', mark: '#6b4e3d', pattern: 'star', ear: 'point', eyes: 'round', mouth: 'smile', body: 'chubby', tail: 'up', acc: [], doodles: ['moon', 'star', 'sparkle'], seed: 6,
    text: 'Twinkle comes out when the sky gets dark. The little star on her forehead glows when she is happy. She walked me home through the glowing flowers so I would not be scared. I was not scared. Okay, maybe a little. Thank you, Twinkle.' },
  { name: 'Grandma Tofu', title: 'Friend No. 8', day: 'Day 11', fur: '#f4efe6', belly: '#ffffff', mark: '#ddd2c0', pattern: 'none', ear: 'fold', eyes: 'round', mouth: 'smile', body: 'fluffy', tail: 'curl', acc: ['glasses', 'scarf'], doodles: ['yarn', 'heart', 'note'], seed: 8,
    text: 'Grandma Tofu is the oldest cat on Meoptune. She knits tiny scarves with her paws, and she made one for me! It is a bit crooked and I love it so much. She tells me stories about the stars. She says I will find my way home. Maybe not today.' },
]

export const INTRO = {
  facts: ['Age: very small', 'From: far, far up in the stars', 'Now living on: Meoptune (the planet of cats!)', 'If lost, return me to: the fluffiest cat pile'],
  text: 'I fell out of the sky and landed on a planet full of cats. Nobody knows how to send me home yet, so I am writing down every cat I meet. That way I will never forget them.',
}
export const ENDING = {
  title: 'To be continued…',
  text: 'There are so many more cats to meet! Tomorrow I will look for the cat who lives in the clouds. (I think she is real.) The end… for now.',
}
