# Profile review before publishing

Please review these fields in `src/data/profile.ts`:

1. **University:** Website profile uses Jadavpur University based on your latest chat message. The copied resume PDF still says JIS University. Verify the correct institution and replace the PDF so the website and resume agree.
2. **CGPA:** Currently displayed as 7.7/10 up to Semester 6, based on latest resume.
3. **LeetCode:** Currently displayed as 500+, based on latest resume dated 21 Nov 2026.
4. **LinkedIn audience:** Currently displayed as 15K+, based on prior profile information.
5. **ISTE role:** General Secretary is included; check whether the tenure should say Present or have an end date.
6. **Certifications:** The list combines the latest resume with previously shared course and simulation details. Check exact titles and credential evidence before publishing.
7. **Project status and links:** SecureCareer AI is marked In development. Add confirmed repository and demo URLs to project data when ready.
8. **Resume PDF:** The included PDF is the latest resume found in the shared Library during package creation. Replace it when you prepare a newer public version.

The site includes your phone number and email from the resume. Remove the phone number from `src/data/profile.ts` if you do not want it displayed publicly.
