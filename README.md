# Studio: World Effects

This project demonstrates how to use World Effects to anchor virtual content to a flat surface.

![Preview of the world effects project open in the editor](./src/assets/preview.jpg)

<details><summary>Try it out</summary>

https://8thwall.org/studio-world-effects-example/

<img alt="QR Code for the preview link" src="https://8th.io/qr?v=2&url=https://8thwall.org/studio-world-effects-example/" width=250 height=250 />

</details>

## Usage

1. [Install the Desktop App](https://8thwall.org/downloads)
2. On this repository, click Code > Download zip
3. Unzip the folder to the location you'd like to work in
4. In the desktop app, click "Open" and select the folder
5. To connect to a mobile device, follow [these instructions](https://8th.io/connect-device)
6. Recommended: Track your files using [git](https://git-scm.com/about) to avoid losing progress

## Video uploads

Recorded clips are uploaded to a Supabase Storage bucket (`src/upload.ts`), and each upload adds a
row to the `potato_videos` table with the sender's name, approximate location and the video's
file name. The location is looked up from the sender's IP address when they tap Send
(`src/location.ts`, via the free GeoJS service), so there's no location prompt. It's usually
right to the city but can be a region off on mobile data, and is rounded to ~1 km. Visitors can upload but cannot list or read anything; view the clips
under Storage and the details under Table Editor in the Supabase dashboard.

1. Create a free project at https://supabase.com
2. Storage > New bucket: name `potato-videos`, leave **Public** off, set file size limit to
   `20 MB` and allowed MIME types to `video/mp4, video/webm`
3. SQL Editor > run:
   ```sql
   create policy "Anyone can upload potato videos"
   on storage.objects for insert to anon
   with check (bucket_id = 'potato-videos');

   create table potato_videos (
     id bigint generated always as identity primary key,
     created_at timestamptz not null default now(),
     name text check (char_length(name) <= 40),
     video_path text not null check (char_length(video_path) <= 200),
     latitude double precision check (latitude between -90 and 90),
     longitude double precision check (longitude between -180 and 180)
   );
   alter table potato_videos enable row level security;
   grant insert on potato_videos to anon;
   create policy "Anyone can add potato video details"
   on potato_videos for insert to anon
   with check (true);
   ```
4. Project Settings > API: copy the Project URL and the anon / publishable key into
   `SUPABASE_URL` and `SUPABASE_KEY` in `src/upload.ts` (the publishable key is safe to ship
   in the site; never use the service_role / secret key)

## Deployment

This project contains Github Actions configuration for deployment to Github Pages, which triggers automatically by pushing the `main` branch. You can also follow the publishing instructions here: https://8thwall.org/docs/getting-started/publishing to publish to any other web host.

## Questions?

Please raise any questions on [Github Discussions](https://github.com/orgs/8thwall/discussions) or join the [Discord](https://8th.io/discord) to connect with the community.

