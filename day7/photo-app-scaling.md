# SnapShare Scaling Plan

## Assumptions

- SnapShare has 10 million registered users; 10% are active daily, so `10,000,000 × 0.10 = 1,000,000` daily active users.
- Each daily active user uploads one 2 MB photo per day and views 50 feed pages per day.
- Each photo gets one 50 KB thumbnail. Sizes use decimal units: 1 MB = 1,000 KB and 1 TB = 1,000,000 MB.
- A feed page view is one application request; image and thumbnail downloads create additional CDN requests that depend on how many photos are displayed per page.
- For capacity planning, peak traffic is assumed to be 5 times the daily average. This is a planning assumption, not a supplied measurement.
- Photos and thumbnails are retained for a year. The storage estimate excludes replication, backups, metadata, and temporary processing files.

## Workload Estimates

- **Uploads:** `1,000,000 uploads/day ÷ 86,400 seconds/day = 11.6 uploads/second` on average; `11.6 × 5 = 58 uploads/second` at the assumed peak.
- **Feed views:** `1,000,000 users × 50 views/day = 50,000,000 views/day`; `50,000,000 ÷ 86,400 = 578.7 feed requests/second` on average; `578.7 × 5 = 2,893.5`, or about `2,894 requests/second` at the assumed peak.
- **Photo storage per year:** 1,000,000 photos/day × 365 days × (2 MB original + 0.05 MB thumbnail) = **748,250,000 MB**, or about **748 TB** (decimal) before replication and backups.
- **Traffic profile:** The system is **read-heavy**: it serves about 50 feed-page views for each photo upload, before counting repeat reads and image downloads. The design should prioritize CDN and feed-cache hits and use the read replica for feed queries, while routing writes to the primary database.

## Photo Storage Decision

Photo files should go in object storage, not inside the database. Large binary files would make the database and its backups much larger, slow backup and restore operations, and compete with metadata transactions for database resources. Object storage is built to store and serve large files independently; the database should keep each photo's owner, timestamp, status, and object-storage key, while the CDN delivers the file to viewers.

## Architecture

```text
FEED AND METADATA
[Clients] -- API/feed --> [Load balancer] --> [App servers] <--> [Cache]
[App servers] -- metadata write --> [Primary DB] -- replication --> [Read replica]
[App servers] -- feed read ---------------------------------------> [Read replica]

PHOTO FILES
[Clients] -- image request --> [CDN] -- cache miss --> [Object storage]
[App servers] -- original upload --------------------> [Object storage]
[App servers] -- thumbnail job --> [Thumbnail queue] --> [Thumbnail worker]
[Object storage] -- original image ------------------> [Thumbnail worker]
[Thumbnail worker] -- thumbnail --------------------> [Object storage]
```

### Components

- **CDN:** Caches and delivers photos and thumbnails near viewers, reducing origin bandwidth and image load latency.
- **Load balancer:** Spreads incoming API traffic across healthy app servers so one instance does not become a bottleneck.
- **App servers:** Handle authentication, uploads, feed assembly, and database/cache access while scaling horizontally as stateless instances.
- **Cache:** Stores hot feed results and frequently accessed follow or profile data to reduce repeated database reads.
- **Primary database:** Stores durable user, follow, photo metadata, and feed-related records and accepts application writes.
- **Read replica:** Serves read queries from a replicated copy of the primary to scale feed reads, with possible replication lag.
- **Object storage:** Holds original photo files and generated thumbnails durably without putting large binary files in the relational database.
- **Thumbnail queue:** Buffers thumbnail jobs so upload requests do not have to wait for image processing to finish.
- **Thumbnail worker:** Consumes queued jobs, resizes originals into thumbnails, stores the results, and updates their metadata.

## Photo Upload Flow

1. The client sends an authenticated upload request to the load balancer, which routes it to an app server.
2. The app server validates the request and creates a photo record with a pending-thumbnail status in the primary database.
3. The app server stores the original image in object storage and records its storage key in the database.
4. The app server publishes a thumbnail job to the queue and returns the upload result without waiting for resizing.
5. A thumbnail worker reads the job, fetches the original from object storage, creates the 50 KB thumbnail, and stores it in object storage.
6. The worker updates the photo record to mark the thumbnail ready; the CDN can then serve the original and thumbnail from their object-storage origin.

## Trade-offs

- **Asynchronous thumbnails vs. immediate completeness:** Queue-based processing keeps upload responses fast and absorbs bursts, but a new photo may appear before its thumbnail is ready; the feed needs a placeholder or original-image fallback.
- **Caching vs. freshness:** Caching feeds reduces database load and latency, but new posts or follow changes can leave cached feeds stale until expiration or invalidation.
- **Read replicas vs. consistency:** Replicas increase read capacity, but replication lag can briefly hide a just-uploaded photo from feed reads; read-after-write requests may need to go to the primary.
- **CDN performance vs. access control:** Public cacheable image URLs are efficient, while private photos require signed or otherwise access-controlled URLs and careful cache expiration.